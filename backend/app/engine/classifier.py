"""
Attack Classification Engine (Feature M2-F13) and Attack Comparison (M2-F18).
Classifies observed telemetry into diagnostic attack conditions while distinguishing
observed evidence from simulator metadata.
"""

from app.models.enums import (
    AttackType,
    AttackClassification,
    CHSHStatus,
    ReasonCode,
)
from app.models.output_models import (
    QBERResult,
    ThresholdResult,
    CHSHResult,
    DecoyResult,
    DiagnosticsResult,
)


def classify_attack_condition(
    qber_result: QBERResult,
    threshold_result: ThresholdResult,
    chsh_result: CHSHResult,
    decoy_result: DecoyResult | None = None,
    simulator_attack_type: AttackType = AttackType.NONE,
) -> DiagnosticsResult:
    """
    Classifies the security condition based on deterministic mathematical evidence.
    """
    reason_codes: list[ReasonCode] = []
    details: dict = {
        "simulator_attack_type": simulator_attack_type.value,
        "observed_qber": qber_result.qber,
        "threshold": threshold_result.threshold,
        "chsh_score": chsh_result.score,
    }

    # 0. Check for insufficient data
    if qber_result.qber is None or qber_result.sample_count == 0:
        return DiagnosticsResult(
            classification=AttackClassification.INSUFFICIENT_DATA,
            reason_codes=[ReasonCode.NO_SIFTED_BITS],
            details=details,
        )

    qber_fail = qber_result.qber > threshold_result.threshold
    chsh_fail = chsh_result.status == CHSHStatus.BELL_TEST_FAILED

    # Include explicit reason codes
    if qber_fail:
        reason_codes.append(ReasonCode.QBER_ABOVE_THRESHOLD)
    else:
        reason_codes.append(ReasonCode.QBER_WITHIN_THRESHOLD)

    if chsh_result.status != CHSHStatus.DISABLED:
        if chsh_fail:
            reason_codes.append(ReasonCode.CHSH_FAIL)
        else:
            reason_codes.append(ReasonCode.CHSH_PASS)

    # 1. Simulator-explicit metadata hints override/augment classification
    if simulator_attack_type == AttackType.FORGERY:
        reason_codes.append(ReasonCode.CLASSICAL_TAMPERING_INDICATOR)
        return DiagnosticsResult(
            classification=AttackClassification.CLASSICAL_TAMPERING,
            reason_codes=reason_codes,
            details=details,
        )
    elif simulator_attack_type == AttackType.REPLAY:
        reason_codes.append(ReasonCode.REPLAY_INDICATOR)
        return DiagnosticsResult(
            classification=AttackClassification.REPLAY_SUSPECTED,
            reason_codes=reason_codes,
            details=details,
        )
    elif simulator_attack_type == AttackType.PNS:
        reason_codes.append(ReasonCode.DECOY_ANOMALY)
        return DiagnosticsResult(
            classification=AttackClassification.PNS_SUSPECTED,
            reason_codes=reason_codes,
            details=details,
        )

    # 2. Observed mathematical telemetry logic
    if decoy_result and decoy_result.status == "ANOMALOUS":
        reason_codes.append(ReasonCode.DECOY_ANOMALY)
        return DiagnosticsResult(
            classification=AttackClassification.PNS_SUSPECTED,
            reason_codes=reason_codes,
            details=details,
        )

    if qber_fail and chsh_fail:
        return DiagnosticsResult(
            classification=AttackClassification.MULTIPLE_INDICATORS,
            reason_codes=reason_codes,
            details=details,
        )
    elif qber_fail and not chsh_fail:
        # High QBER - check if Intercept-Resend (MITM) levels (> 20%)
        if qber_result.qber >= 0.20:
            classification = AttackClassification.MITM_SUSPECTED
        else:
            classification = AttackClassification.HIGH_QBER
        return DiagnosticsResult(
            classification=classification,
            reason_codes=reason_codes,
            details=details,
        )
    elif not qber_fail and chsh_fail:
        return DiagnosticsResult(
            classification=AttackClassification.ENTANGLEMENT_DEGRADATION,
            reason_codes=reason_codes,
            details=details,
        )
    else:
        # QBER <= threshold and CHSH passes
        if qber_result.qber > threshold_result.baseline_qber:
            classification = AttackClassification.CHANNEL_NOISE
            reason_codes.append(ReasonCode.BASELINE_NOISE_EXCEEDED)
        else:
            classification = AttackClassification.NORMAL
        return DiagnosticsResult(
            classification=classification,
            reason_codes=reason_codes,
            details=details,
        )
