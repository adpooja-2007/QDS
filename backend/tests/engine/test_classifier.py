"""
Unit tests for Attack Classification (Feature M2-F13).
"""

from app.models.enums import AttackType, AttackClassification, CHSHStatus
from app.models.output_models import QBERResult, ThresholdResult, CHSHResult
from app.engine.classifier import classify_attack_condition


def test_classify_normal():
    """QBER <= T and CHSH >= 2 -> NORMAL."""
    qber_res = QBERResult(qber=0.02, qber_percentage=2.0, error_count=2, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=2.72, classical_bound=2.0, bell_violation=True, status=CHSHStatus.STRONG_ENTANGLEMENT)

    diag = classify_attack_condition(qber_res, thresh_res, chsh_res)
    assert diag.classification == AttackClassification.NORMAL


def test_classify_mitm_suspected():
    """QBER >= 20% and CHSH >= 2 -> MITM_SUSPECTED."""
    qber_res = QBERResult(qber=0.25, qber_percentage=25.0, error_count=25, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=2.72, classical_bound=2.0, bell_violation=True, status=CHSHStatus.STRONG_ENTANGLEMENT)

    diag = classify_attack_condition(qber_res, thresh_res, chsh_res)
    assert diag.classification == AttackClassification.MITM_SUSPECTED


def test_classify_multiple_indicators():
    """QBER > T and CHSH < 2 -> MULTIPLE_INDICATORS."""
    qber_res = QBERResult(qber=0.25, qber_percentage=25.0, error_count=25, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=1.80, classical_bound=2.0, bell_violation=False, status=CHSHStatus.BELL_TEST_FAILED)

    diag = classify_attack_condition(qber_res, thresh_res, chsh_res)
    assert diag.classification == AttackClassification.MULTIPLE_INDICATORS


def test_classify_simulator_forgery_metadata():
    """Explicit simulator attack_type FORGERY -> CLASSICAL_TAMPERING."""
    qber_res = QBERResult(qber=0.35, qber_percentage=35.0, error_count=35, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=2.72, classical_bound=2.0, bell_violation=True, status=CHSHStatus.STRONG_ENTANGLEMENT)

    diag = classify_attack_condition(qber_res, thresh_res, chsh_res, simulator_attack_type=AttackType.FORGERY)
    assert diag.classification == AttackClassification.CLASSICAL_TAMPERING
