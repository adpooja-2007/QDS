"""
Session management and telemetry API router.

Provides endpoints for:
- Listing all sessions
- Getting session details
- Resetting sessions
- Viewing telemetry logs
"""

from fastapi import APIRouter

from app.schemas.session import SessionResponse, SessionListResponse
from app.schemas.common import BaseResponse, TelemetryResponse, TelemetryEntrySchema
from app.services.session_service import session_service
from app.core.middleware import telemetry_store

router = APIRouter(
    tags=["Sessions & Telemetry"],
    responses={404: {"description": "Session not found"}},
)


@router.get(
    "/sessions/",
    response_model=SessionListResponse,
    summary="List all sessions",
    description="Retrieve all quantum sessions with their current state.",
)
async def list_sessions():
    sessions = session_service.list_all()
    return SessionListResponse(
        success=True,
        message=f"Found {len(sessions)} session(s)",
        total=len(sessions),
        sessions=sessions,
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    summary="Get session details",
    description="Retrieve the full state of a specific quantum session.",
)
async def get_session(session_id: str):
    session = session_service.get(session_id)
    return SessionResponse(
        success=True,
        message=f"Session {session_id} retrieved",
        session=session,
    )


@router.post(
    "/sessions/{session_id}/reset",
    response_model=SessionResponse,
    summary="Reset a session",
    description=(
        "Reset a session back to EPR_READY state. "
        "Clears all Alice/Bob data, sifting results, attacks, and security results. "
        "Generates a new nonce for replay protection."
    ),
)
async def reset_session(session_id: str):
    session = session_service.reset(session_id)
    return SessionResponse(
        success=True,
        message=f"Session {session_id} reset to EPR_READY",
        session=session,
    )


@router.get(
    "/telemetry/",
    response_model=TelemetryResponse,
    summary="Get telemetry log",
    description=(
        "Retrieve the telemetry log containing timing, request IDs, "
        "and session correlation for all recent API calls."
    ),
)
async def get_telemetry(limit: int = 100):
    entries = list(telemetry_store)[-limit:]
    return TelemetryResponse(
        success=True,
        message=f"Showing {len(entries)} of {len(telemetry_store)} telemetry entries",
        total_entries=len(telemetry_store),
        entries=[
            TelemetryEntrySchema(**e.to_dict())
            for e in entries
        ],
    )
