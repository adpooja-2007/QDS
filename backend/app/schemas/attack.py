"""
Attack simulation Pydantic schemas.
Request/response models for all five attack types:
Intercept-Resend, Forgery, Replay, Channel Noise, and PNS.
"""

from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.common import BaseResponse


# ── Intercept-Resend (MitM) ──────────────────────────────────────────

class InterceptResendRequest(BaseModel):
    """Request to inject an intercept-resend (MitM) attack."""
    session_id: str = Field(..., description="Target session ID")
    attack_fraction: float = Field(
        default=0.25, ge=0.0, le=1.0,
        description="Fraction of qubits intercepted by Eve (0.0 to 1.0)"
    )
    basis_strategy: str = Field(
        default="RANDOM",
        description="Eve's measurement basis strategy: RANDOM, Z_ONLY, X_ONLY"
    )


# ── Signature Forgery ────────────────────────────────────────────────

class ForgeryRequest(BaseModel):
    """Request to inject a classical signature forgery attack."""
    session_id: str = Field(..., description="Target session ID")
    attack_fraction: float = Field(
        default=0.10, ge=0.0, le=1.0,
        description="Fraction of classical feed-forward bits to modify"
    )


# ── Replay ───────────────────────────────────────────────────────────

class ReplayRequest(BaseModel):
    """Request to attempt a replay attack."""
    session_id: str = Field(
        ..., description="Current active session to attack"
    )
    replay_session_id: str = Field(
        ..., description="Previous session whose data to replay"
    )


# ── Channel Noise ────────────────────────────────────────────────────

class NoiseRequest(BaseModel):
    """Request to inject physical channel noise."""
    session_id: str = Field(..., description="Target session ID")
    noise_model: str = Field(
        default="DEPOLARIZING",
        description="Noise model: DEPOLARIZING, BIT_FLIP, PHASE_FLIP, AMPLITUDE_DAMPING"
    )
    probability: float = Field(
        default=0.02, ge=0.0, le=1.0,
        description="Noise probability per qubit"
    )


# ── PNS (Photon-Number-Splitting) ────────────────────────────────────

class PNSRequest(BaseModel):
    """Request to inject a PNS attack."""
    session_id: str = Field(..., description="Target session ID")
    intensity: float = Field(
        default=0.20, ge=0.0, le=1.0,
        description="Multi-photon splitting intensity"
    )


# ── Common Attack Response ───────────────────────────────────────────

class AttackResponse(BaseResponse):
    """Standard response for all attack injection endpoints."""
    attack_id: str
    attack_type: str
    session_id: str
    affected_count: int = Field(
        ..., description="Number of qubits/bits affected by the attack"
    )
    total_count: int = Field(
        ..., description="Total number of qubits/bits in the session"
    )
    attack_fraction: float
    status: str = "INJECTED"
    details: dict = {}


class ReplayResponse(BaseResponse):
    """Response specific to replay attack attempts."""
    attack_id: str
    attack_type: str = "REPLAY"
    session_id: str
    replay_session_id: str
    detected: bool
    reason: str
    status: str
