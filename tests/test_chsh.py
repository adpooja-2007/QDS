"""
Unit tests for CHSH Entanglement Evaluator (Feature M2-F11).
"""

from app.models.enums import CHSHStatus
from app.engine.chsh import evaluate_chsh_score


def test_chsh_strong_entanglement():
    """Tests S >= 2.4 produces STRONG_ENTANGLEMENT and PASS status."""
    res = evaluate_chsh_score(score=2.72, enabled=True)

    assert res.score == 2.72
    assert res.classical_bound == 2.0
    assert res.bell_violation is True
    assert res.status == CHSHStatus.STRONG_ENTANGLEMENT


def test_chsh_weak_entanglement():
    """Tests 2.0 <= S < 2.4 produces WEAK_ENTANGLEMENT and PASS status."""
    res = evaluate_chsh_score(score=2.15, enabled=True)

    assert res.score == 2.15
    assert res.bell_violation is True
    assert res.status == CHSHStatus.WEAK_ENTANGLEMENT


def test_chsh_bell_test_failed():
    """Tests S < 2.0 produces BELL_TEST_FAILED."""
    res = evaluate_chsh_score(score=1.85, enabled=True)

    assert res.score == 1.85
    assert res.bell_violation is False
    assert res.status == CHSHStatus.BELL_TEST_FAILED


def test_chsh_disabled():
    """Tests disabled CHSH evaluation."""
    res = evaluate_chsh_score(score=None, enabled=False)

    assert res.status == CHSHStatus.DISABLED
    assert res.bell_violation is False
