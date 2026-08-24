"""
Custom exceptions and global exception handlers for the QDS API.
Provides consistent error responses across all endpoints.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone


# ── Custom Exception Classes ──────────────────────────────────────────

class QDSBaseException(Exception):
    """Base exception for all QDS API errors."""

    def __init__(self, message: str, status_code: int = 500, detail: str = ""):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


class SessionNotFoundError(QDSBaseException):
    """Raised when a requested session does not exist."""

    def __init__(self, session_id: str):
        super().__init__(
            message=f"Session '{session_id}' not found",
            status_code=404,
            detail=f"No active quantum session with ID '{session_id}'. "
                   f"Use POST /api/v1/arbitrator/epr-distribute to create one.",
        )


class SessionExpiredError(QDSBaseException):
    """Raised when a session has expired."""

    def __init__(self, session_id: str):
        super().__init__(
            message=f"Session '{session_id}' has expired",
            status_code=410,
            detail="The EPR session has expired. Create a new session.",
        )


class InvalidSessionStateError(QDSBaseException):
    """Raised when an operation is attempted on a session in the wrong state."""

    def __init__(self, session_id: str, current_state: str, required_state: str):
        super().__init__(
            message=f"Session '{session_id}' is in state '{current_state}', "
                    f"but '{required_state}' is required",
            status_code=409,
            detail=f"The session must be in '{required_state}' state to perform "
                   f"this operation. Current state: '{current_state}'.",
        )


class ReplayDetectedError(QDSBaseException):
    """Raised when a replay attack is detected via session binding."""

    def __init__(self, session_id: str, replay_session_id: str):
        super().__init__(
            message="REPLAY ATTACK DETECTED",
            status_code=403,
            detail=f"Attempted to replay data from session '{replay_session_id}' "
                   f"into active session '{session_id}'. "
                   f"Session binding / nonce mismatch detected.",
        )


class AttackAlreadyActiveError(QDSBaseException):
    """Raised when trying to inject an attack while one is already active."""

    def __init__(self, session_id: str, active_attack: str):
        super().__init__(
            message=f"Attack '{active_attack}' is already active on session '{session_id}'",
            status_code=409,
            detail="Reset the session or wait for the current attack to complete.",
        )


class InsufficientDataError(QDSBaseException):
    """Raised when there isn't enough data to perform an operation."""

    def __init__(self, operation: str, required: str):
        super().__init__(
            message=f"Insufficient data for operation '{operation}'",
            status_code=400,
            detail=f"Required: {required}",
        )


# ── Global Exception Handlers ────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers with the FastAPI application."""

    @app.exception_handler(QDSBaseException)
    async def qds_exception_handler(request: Request, exc: QDSBaseException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.message,
                "detail": exc.detail,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Validation Error",
                "detail": str(exc),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal Server Error",
                "detail": str(exc),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "path": str(request.url.path),
            },
        )
