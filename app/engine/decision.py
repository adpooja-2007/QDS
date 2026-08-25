"""
Deterministic Decision Gate Engine (Feature M2-F14).
Produces strict ACCEPT / REJECT security output based on deterministic bounds.
"""

from app.models.enums import (
    SecurityDecision,
    SecurityStatus,
    CHSHStatus,
    ReasonCode,
)
from app.models.output_models import (
    QBERResult,
    ThresholdResult,
    CHSHResult,
    DecoyResult,
    DecisionResult,
)


def evaluate_decision_gate(
    qber_result: QBERResult,
    threshold_result: ThresholdResult,
    chsh_result: CHSHResult,
    decoy_result: DecoyResult | None = None,
) -> DecisionResult:
    """
    Evaluates the deterministic security decision gate:
    Decision = (QBER <= Threshold) AND CHSH_PASS (if CHSH is enabled)
    """
    reason_codes: list[ReasonCode] = []

    # Handle insufficient sifted bits edge case
    if qber_result.qber is None or qber_result.sample_count == 0:
        reason_codes.append(ReasonCode.NO_SIFTED_BITS)
        return DecisionResult(
            qber_pass=False,
            chsh_pass=chsh_result.bell_violation if chsh_result.status != CHSHStatus.DISABLED else True,
            authenticated=False,
            decision=SecurityDecision.REJECT,
            status=SecurityStatus.INVALID,
            reason_codes=reason_codes,
        )

    # 1. QBER vs Threshold Evaluation
    qber_pass = qber_result.qber <= threshold_result.threshold
    if qber_pass:
        reason_codes.append(ReasonCode.QBER_WITHIN_THRESHOLD)
    else:
        reason_codes.append(ReasonCode.QBER_ABOVE_THRESHOLD)

    # 2. CHSH Entanglement Evaluation
    if chsh_result.status == CHSHStatus.DISABLED:
        chsh_pass = True
    else:
        chsh_pass = chsh_result.bell_violation
        if chsh_pass:
            reason_codes.append(ReasonCode.CHSH_PASS)
        else:
            reason_codes.append(ReasonCode.CHSH_FAIL)

    # 3. Decoy Evaluation check (if enabled)
    if decoy_result and decoy_result.status == "ANOMALOUS":
        reason_codes.append(ReasonCode.DECOY_ANOMALY)

    # Final Boolean Decision
    authenticated = qber_pass and chsh_pass
    final_decision = SecurityDecision.ACCEPT if authenticated else SecurityDecision.REJECT

    # Security Status determination
    if authenticated:
        # Check margin for warning state (if QBER is near threshold within 10%)
        margin = threshold_result.threshold - qber_result.qber
        if margin < 0.01 and threshold_result.threshold > 0:
            status = SecurityStatus.WARNING
        else:
            status = SecurityStatus.SECURE
    else:
        status = SecurityStatus.THREAT

    return DecisionResult(
        qber_pass=qber_pass,
        chsh_pass=chsh_pass,
        authenticated=authenticated,
        decision=final_decision,
        status=status,
        reason_codes=reason_codes,
    )
