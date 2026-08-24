"""
Telemetry middleware for the FastAPI application.
Captures request timing, IDs, and session correlation for every API call.
"""

import time
import uuid
import logging
from collections import deque
from datetime import datetime, timezone
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger("qds.telemetry")


class TelemetryEntry:
    """Represents a single telemetry log entry."""

    __slots__ = (
        "request_id", "endpoint", "method", "timestamp",
        "execution_time_ms", "status_code", "session_id", "error"
    )

    def __init__(
        self,
        request_id: str,
        endpoint: str,
        method: str,
        timestamp: str,
        execution_time_ms: float,
        status_code: int,
        session_id: Optional[str] = None,
        error: Optional[str] = None,
    ):
        self.request_id = request_id
        self.endpoint = endpoint
        self.method = method
        self.timestamp = timestamp
        self.execution_time_ms = execution_time_ms
        self.status_code = status_code
        self.session_id = session_id
        self.error = error

    def to_dict(self) -> dict:
        return {
            "request_id": self.request_id,
            "endpoint": self.endpoint,
            "method": self.method,
            "timestamp": self.timestamp,
            "execution_time_ms": round(self.execution_time_ms, 3),
            "status_code": self.status_code,
            "session_id": self.session_id,
            "error": self.error,
        }


# ── Global telemetry store (bounded ring buffer) ──────────────────────
telemetry_store: deque = deque(maxlen=settings.TELEMETRY_MAX_ENTRIES)


class TelemetryMiddleware(BaseHTTPMiddleware):
    """
    Middleware that intercepts every request to record:
    - Unique request ID
    - Endpoint path and HTTP method
    - ISO 8601 timestamp
    - Execution time in milliseconds (via time.perf_counter)
    - HTTP status code
    - Associated session ID (extracted from path or body when available)
    - Error information if the response indicates failure
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()
        timestamp = datetime.now(timezone.utc).isoformat()

        # Inject request_id into request state for downstream use
        request.state.request_id = request_id

        # Try to extract session_id from path parameters
        session_id = self._extract_session_id(request)

        try:
            response = await call_next(request)
            execution_time_ms = (time.perf_counter() - start_time) * 1000

            entry = TelemetryEntry(
                request_id=request_id,
                endpoint=str(request.url.path),
                method=request.method,
                timestamp=timestamp,
                execution_time_ms=execution_time_ms,
                status_code=response.status_code,
                session_id=session_id,
                error=None if response.status_code < 400 else f"HTTP {response.status_code}",
            )

            telemetry_store.append(entry)

            # Log the telemetry entry
            logger.info(
                "%s %s %s %.1fms %s",
                request.method,
                request.url.path,
                response.status_code,
                execution_time_ms,
                f"session={session_id}" if session_id else "",
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as exc:
            execution_time_ms = (time.perf_counter() - start_time) * 1000

            entry = TelemetryEntry(
                request_id=request_id,
                endpoint=str(request.url.path),
                method=request.method,
                timestamp=timestamp,
                execution_time_ms=execution_time_ms,
                status_code=500,
                session_id=session_id,
                error=str(exc),
            )

            telemetry_store.append(entry)

            logger.error(
                "%s %s ERROR %.1fms %s — %s",
                request.method,
                request.url.path,
                execution_time_ms,
                f"session={session_id}" if session_id else "",
                str(exc),
            )

            raise

    @staticmethod
    def _extract_session_id(request: Request) -> Optional[str]:
        """
        Attempt to extract a session_id from the URL path.
        Looks for path segments matching the QKD-* pattern.
        """
        path_parts = request.url.path.strip("/").split("/")
        for part in path_parts:
            if part.startswith("QKD-"):
                return part
        return None
