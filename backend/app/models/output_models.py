"""
Output Pydantic models for Module 2 Threat Engine responses and reports.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import (
    SecurityDecision,
    SecurityStatus,
    CHSHStatus,
    DecoyStatus,
    AttackClassification,
    ReasonCode,
)


class SiftingResult(BaseModel):
    total_bits: int
    matching_bits: int
    discarded_bits: int
    sifting_ratio: float
    matching_indices: list[int]
    discarded_indices: list[int]
    alice_sifted_bits: list[int]
    bob_sifted_bits: list[int]


class XORResult(BaseModel):
    mismatch_bits: list[int]
    mismatch_count: int
    match_count: int
    total_compared: int


class QBERResult(BaseModel):
    qber: float | None
    qber_percentage: float | None
    error_count: int
    sample_count: int
    status: str = "COMPLETED"
    error_code: str | None = None


class ThresholdResult(BaseModel):
    baseline_qber: float
    sample_count: int
    false_alarm_rate: float
    delta: float
    threshold: float
    is_capped: bool = False


class CHSHResult(BaseModel):
    score: float | None
    classical_bound: float = 2.0
    quantum_limit: float = 2.8284271247461903
    bell_violation: bool = False
    status: CHSHStatus = CHSHStatus.DISABLED


class DecoyResult(BaseModel):
    signal_error_rate: float | None = None
    decoy_error_rate: float | None = None
    error_rate_difference: float | None = None
    status: DecoyStatus = DecoyStatus.DISABLED


class DecisionResult(BaseModel):
    qber_pass: bool
    chsh_pass: bool
    authenticated: bool
    decision: SecurityDecision
    status: SecurityStatus
    reason_codes: list[ReasonCode]


class DiagnosticsResult(BaseModel):
    classification: AttackClassification
    reason_codes: list[ReasonCode]
    details: dict = Field(default_factory=dict)


class TelemetryResult(BaseModel):
    execution_time_ms: float
    input_bits: int
    sifted_bits: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SecurityAuditResponse(BaseModel):
    session_id: str
    block_id: str
    status: str = "COMPLETED"
    error_code: str | None = None
    message: str | None = None
    sifting: SiftingResult | None = None
    error_analysis: XORResult | None = None
    qber_analysis: QBERResult | None = None
    threshold_analysis: ThresholdResult | None = None
    chsh_analysis: CHSHResult | None = None
    decoy_analysis: DecoyResult | None = None
    decision: DecisionResult | None = None
    diagnostics: DiagnosticsResult | None = None
    telemetry: TelemetryResult | None = None


class StandardErrorResponse(BaseModel):
    status: str = "INVALID_INPUT"
    error_code: str
    message: str
    field: str | None = None
