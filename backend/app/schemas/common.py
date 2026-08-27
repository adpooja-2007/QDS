"""
Common Pydantic schemas shared across all API endpoints.
Defines base response models, error formats, and telemetry structures.
"""

from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BaseResponse(BaseModel):
    """Standard response wrapper for all successful API responses."""
    success: bool = True
    message: str = "OK"
    timestamp: datetime = Field(default_factory=utc_now)


class ErrorResponse(BaseModel):
    """Standard error response format."""
    success: bool = False
    error: str
    detail: str = ""
    timestamp: datetime = Field(default_factory=utc_now)
    path: Optional[str] = None



class TelemetryEntrySchema(BaseModel):
    """Schema for a single telemetry log entry."""
    request_id: str
    endpoint: str
    method: str
    timestamp: str
    execution_time_ms: float
    status_code: int
    session_id: Optional[str] = None
    error: Optional[str] = None


class TelemetryResponse(BaseResponse):
    """Response containing telemetry entries."""
    total_entries: int = 0
    entries: list[TelemetryEntrySchema] = []


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    module: str = "Module 3 — Distributed Node API"
    version: str = "1.0.0"
    active_sessions: int = 0
    telemetry_entries: int = 0
    timestamp: datetime = Field(default_factory=utc_now)

