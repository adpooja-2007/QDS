"""
Security Audit & Dashboard Report Adapter (Features M2-F15, M2-F19, M2-F25).
Assembles domain mathematical results into complete SecurityAuditResponse objects.
"""

from datetime import datetime, timezone
from app.models.output_models import (
    SiftingResult,
    XORResult,
    QBERResult,
    ThresholdResult,
    CHSHResult,
    DecoyResult,
    DecisionResult,
    DiagnosticsResult,
    TelemetryResult,
    SecurityAuditResponse,
)


def build_security_audit_report(
    session_id: str,
    block_id: str,
    sifting: SiftingResult,
    error_analysis: XORResult,
    qber_analysis: QBERResult,
    threshold_analysis: ThresholdResult,
    chsh_analysis: CHSHResult,
    decoy_analysis: DecoyResult | None,
    decision: DecisionResult,
    diagnostics: DiagnosticsResult,
    execution_time_ms: float,
) -> SecurityAuditResponse:
    """
    Constructs the canonical SecurityAuditResponse object.
    Fully ready for frontend (Module 5) visualization and API response delivery.
    """
    telemetry = TelemetryResult(
        execution_time_ms=round(execution_time_ms, 3),
        input_bits=sifting.total_bits,
        sifted_bits=sifting.matching_bits,
        timestamp=datetime.now(timezone.utc),
    )

    status_str = "COMPLETED" if qber_analysis.status == "COMPLETED" else "INSUFFICIENT_DATA"

    return SecurityAuditResponse(
        session_id=session_id,
        block_id=block_id,
        status=status_str,
        error_code=qber_analysis.error_code,
        message=None,
        sifting=sifting,
        error_analysis=error_analysis,
        qber_analysis=qber_analysis,
        threshold_analysis=threshold_analysis,
        chsh_analysis=chsh_analysis,
        decoy_analysis=decoy_analysis,
        decision=decision,
        diagnostics=diagnostics,
        telemetry=telemetry,
    )
