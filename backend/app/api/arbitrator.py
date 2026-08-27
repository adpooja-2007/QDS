"""
Arbitrator node API router.

The Arbitrator is the trusted third party that:
- Generates and distributes EPR pairs
- Creates quantum sessions
- Monitors session lifecycle
- Coordinates Alice ↔ Bob communication
"""

from fastapi import APIRouter

from app.schemas.quantum import EPRDistributeRequest, EPRDistributeResponse
from app.schemas.session import SessionResponse, SessionListResponse
from app.services.session_service import session_service
from app.services.quantum_service import quantum_service

router = APIRouter(
    prefix="/arbitrator",
    tags=["Arbitrator"],
    responses={404: {"description": "Session not found"}},
)


@router.post(
    "/epr-distribute",
    response_model=EPRDistributeResponse,
    summary="Generate EPR pairs and create a quantum session",
    description=(
        "The Arbitrator generates N entangled EPR pairs (|Φ+⟩ Bell states) "
        "and distributes one qubit to Alice and one to Bob. "
        "This creates a new quantum session and returns the session ID."
    ),
)
async def epr_distribute(request: EPRDistributeRequest):
    # Step 1: Create a new session
    session = session_service.create(
        num_pairs=request.num_pairs,
        baseline_noise=request.baseline_noise,
        alpha=request.alpha,
    )

    # Step 2: Generate EPR pairs (simulated)
    result = quantum_service.generate_epr(session.session_id, request.num_pairs)

    return EPRDistributeResponse(
        success=True,
        message=f"EPR distribution complete. {request.num_pairs} pairs generated.",
        session_id=session.session_id,
        num_pairs=request.num_pairs,
        status="EPR_READY",
        nonce=session.nonce,
    )


@router.get(
    "/session/{session_id}",
    response_model=SessionResponse,
    summary="Get full session details",
    description="Retrieve the complete state of a quantum session.",
)
@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    include_in_schema=False,
)
async def get_session(session_id: str):

    session = session_service.get(session_id)
    return SessionResponse(
        success=True,
        message=f"Session {session_id} retrieved",
        session=session,
    )


@router.get(
    "/sessions",
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
