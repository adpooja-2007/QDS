"""
Unit tests for Deterministic Decision Gate Truth Table (Feature M2-F14).
"""

from app.models.enums import SecurityDecision, SecurityStatus, CHSHStatus, ReasonCode
from app.models.output_models import QBERResult, ThresholdResult, CHSHResult, DecoyResult
from app.engine.decision import evaluate_decision_gate


def test_truth_table_accept_both_pass():
    """QBER PASS and CHSH PASS -> ACCEPT."""
    qber_res = QBERResult(qber=0.02, qber_percentage=2.0, error_count=2, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=2.72, classical_bound=2.0, bell_violation=True, status=CHSHStatus.STRONG_ENTANGLEMENT)

    res = evaluate_decision_gate(qber_res, thresh_res, chsh_res)

    assert res.qber_pass is True
    assert res.chsh_pass is True
    assert res.authenticated is True
    assert res.decision == SecurityDecision.ACCEPT
    assert res.status == SecurityStatus.SECURE
    assert ReasonCode.QBER_WITHIN_THRESHOLD in res.reason_codes
    assert ReasonCode.CHSH_PASS in res.reason_codes


def test_truth_table_reject_qber_fail():
    """QBER FAIL and CHSH PASS -> REJECT."""
    qber_res = QBERResult(qber=0.25, qber_percentage=25.0, error_count=25, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=2.72, classical_bound=2.0, bell_violation=True, status=CHSHStatus.STRONG_ENTANGLEMENT)

    res = evaluate_decision_gate(qber_res, thresh_res, chsh_res)

    assert res.qber_pass is False
    assert res.chsh_pass is True
    assert res.authenticated is False
    assert res.decision == SecurityDecision.REJECT
    assert res.status == SecurityStatus.THREAT
    assert ReasonCode.QBER_ABOVE_THRESHOLD in res.reason_codes


def test_truth_table_reject_chsh_fail():
    """QBER PASS and CHSH FAIL -> REJECT."""
    qber_res = QBERResult(qber=0.02, qber_percentage=2.0, error_count=2, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=1.80, classical_bound=2.0, bell_violation=False, status=CHSHStatus.BELL_TEST_FAILED)

    res = evaluate_decision_gate(qber_res, thresh_res, chsh_res)

    assert res.qber_pass is True
    assert res.chsh_pass is False
    assert res.authenticated is False
    assert res.decision == SecurityDecision.REJECT
    assert ReasonCode.CHSH_FAIL in res.reason_codes


def test_truth_table_reject_both_fail():
    """QBER FAIL and CHSH FAIL -> REJECT."""
    qber_res = QBERResult(qber=0.25, qber_percentage=25.0, error_count=25, sample_count=100)
    thresh_res = ThresholdResult(baseline_qber=0.02, sample_count=100, false_alarm_rate=1e-9, delta=0.10, threshold=0.12)
    chsh_res = CHSHResult(score=1.80, classical_bound=2.0, bell_violation=False, status=CHSHStatus.BELL_TEST_FAILED)

    res = evaluate_decision_gate(qber_res, thresh_res, chsh_res)

    assert res.qber_pass is False
    assert res.chsh_pass is False
    assert res.authenticated is False
    assert res.decision == SecurityDecision.REJECT
