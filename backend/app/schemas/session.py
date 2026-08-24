"""
Session Pydantic schemas.
Defines the central QuantumSession data model — the single source of truth
for every transaction flowing through the system.
"""

from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.common import BaseResponse, utc_now


# ── Sub-models ────────────────────────────────────────────────────────

class SessionParameters(BaseModel):
    """Configurable parameters for a quantum session."""
    num_pairs: int = 1000
    baseline_noise: float = 0.02
    alpha: float = 1e-6


class AliceData(BaseModel):
    """Alice's state within a session."""
    document_hash: Optional[str] = None
    bits: List[int] = []
    bases: List[str] = []
    bell_measurements: List[str] = []


class BobData(BaseModel):
    """Bob's state within a session."""
    bases: List[str] = []
    measurements: List[int] = []
    corrections: List[str] = []


class SiftingData(BaseModel):
    """Basis sifting results."""
    matched_indices: List[int] = []
    alice_bits: List[int] = []
    bob_bits: List[int] = []
    sifted_length: int = 0


class AttackRecord(BaseModel):
    """Record of an attack applied to a session."""
    attack_id: str
    attack_type: str
    attack_fraction: float = 0.0
    affected_count: int = 0
    timestamp: datetime = Field(default_factory=utc_now)
    details: dict = {}


class SecurityResult(BaseModel):
    """Security audit results."""
    error_count: Optional[int] = None
    sifted_bits: Optional[int] = None
    qber: Optional[float] = None
    threshold: Optional[float] = None
    hoeffding_delta: Optional[float] = None
    chsh: Optional[float] = None
    chsh_status: Optional[str] = None
    qber_pass: Optional[bool] = None
    chsh_pass: Optional[bool] = None
    decision: Optional[str] = None
    threat_detected: Optional[bool] = None
    threat_type: Optional[str] = None


# ── Main Session Model ───────────────────────────────────────────────

class QuantumSession(BaseModel):
    """
    Central session object that tracks the entire lifecycle of a
    quantum digital signature transaction.

    Status flow:
        CREATED → EPR_READY → SIGNED → MEASURED → SIFTED → AUDITED → CLOSED
    """
    session_id: str
    status: str = "CREATED"
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    nonce: str = ""
    parameters: SessionParameters = Field(default_factory=SessionParameters)
    alice: AliceData = Field(default_factory=AliceData)
    bob: BobData = Field(default_factory=BobData)
    sifting: SiftingData = Field(default_factory=SiftingData)
    attacks: List[AttackRecord] = []
    security: SecurityResult = Field(default_factory=SecurityResult)



# ── Request / Response Models ─────────────────────────────────────────

class SessionCreateRequest(BaseModel):
    """Request to create a new quantum session (used internally)."""
    num_pairs: int = Field(default=1000, ge=10, le=100000, description="Number of EPR pairs to generate")
    baseline_noise: float = Field(default=0.02, ge=0.0, le=0.5, description="Expected baseline channel noise")
    alpha: float = Field(default=1e-6, gt=0.0, lt=1.0, description="Target false-alarm probability")


class SessionResponse(BaseResponse):
    """Response containing a full session snapshot."""
    session: QuantumSession


class SessionListResponse(BaseResponse):
    """Response containing a list of session summaries."""
    total: int = 0
    sessions: List[QuantumSession] = []


class SessionSummary(BaseModel):
    """Lightweight session summary for listing."""
    session_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    num_pairs: int
    has_attacks: bool = False
    decision: Optional[str] = None
