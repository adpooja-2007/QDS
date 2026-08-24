"""
Security / threat-detection Pydantic schemas.
Request/response models for QBER, Hoeffding threshold, CHSH,
and the main security audit endpoint.
"""

from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.common import BaseResponse


# ── QBER ──────────────────────────────────────────────────────────────

class QBERRequest(BaseModel):
    """Direct QBER calculation from bit arrays."""
    alice_bits: List[int] = Field(..., description="Alice's sifted bit values (0/1)")
    bob_bits: List[int] = Field(..., description="Bob's sifted bit values (0/1)")


class QBERResponse(BaseResponse):
    """QBER calculation result."""
    error_count: int
    total_bits: int
    qber: float = Field(..., description="Quantum Bit Error Rate (0.0 to 1.0)")
    qber_percentage: float = Field(..., description="QBER as percentage")


# ── Hoeffding Threshold ───────────────────────────────────────────────

class ThresholdRequest(BaseModel):
    """Request to calculate the Hoeffding threshold."""
    sample_size: int = Field(..., ge=1, description="Number of sifted samples (N)")
    baseline_qber: float = Field(
        default=0.02, ge=0.0, le=0.5,
        description="Expected baseline noise level (e0)"
    )
    alpha: float = Field(
        default=1e-6, gt=0.0, lt=1.0,
        description="Target false-alarm probability (α)"
    )


class ThresholdResponse(BaseResponse):
    """Hoeffding threshold calculation result."""
    sample_size: int
    baseline_qber: float
    alpha: float
    delta: float = Field(..., description="Hoeffding statistical margin (Δ)")
    threshold: float = Field(..., description="Security threshold T = e0 + Δ")


# ── CHSH Bell Inequality ─────────────────────────────────────────────

class CHSHCorrelations(BaseModel):
    """CHSH correlation coefficient inputs."""
    E_ab: float = Field(..., ge=-1.0, le=1.0)
    E_ab_prime: float = Field(..., ge=-1.0, le=1.0)
    E_a_prime_b: float = Field(..., ge=-1.0, le=1.0)
    E_a_prime_b_prime: float = Field(..., ge=-1.0, le=1.0)


class CHSHRequest(BaseModel):
    """Request to calculate CHSH S-value."""
    correlations: CHSHCorrelations


class CHSHResponse(BaseResponse):
    """CHSH Bell inequality test result."""
    S: float = Field(..., description="CHSH correlation score")
    classical_bound: float = 2.0
    quantum_ideal: float = 2.828
    status: str = Field(
        ...,
        description="ENTANGLEMENT_PRESENT / CORRELATION_DEGRADED / BELL_VIOLATION_FAILED"
    )


# ── Full Security Audit ──────────────────────────────────────────────

class AuditRequest(BaseModel):
    """Request to run a full security audit on a session."""
    session_id: str = Field(..., description="Session to audit")


class AuditMetrics(BaseModel):
    """Security metrics from a full audit."""
    sifted_bits: int
    error_count: int
    qber: float
    qber_percentage: float
    baseline_noise: float
    hoeffding_delta: float
    threshold: float
    threshold_percentage: float
    chsh: float
    chsh_status: str


class AuditDecision(BaseModel):
    """Security decision from a full audit."""
    qber_pass: bool
    chsh_pass: bool
    session_valid: bool
    overall: str = Field(..., description="ACCEPT or REJECT")


class AuditThreat(BaseModel):
    """Threat assessment from a full audit."""
    detected: bool
    type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None


class AuditResponse(BaseResponse):
    """Full security audit response — the main data source for the dashboard."""
    session_id: str
    metrics: AuditMetrics
    decision: AuditDecision
    threat: AuditThreat
