"""
Unit tests for Hoeffding Calculation (Feature M2-F08) and Security Threshold (M2-F09).
"""

import math
from app.engine.hoeffding import calculate_hoeffding_threshold


def test_hoeffding_threshold_calculation():
    """Tests Hoeffding threshold formula calculation: delta = sqrt(ln(1/alpha) / 2N)."""
    baseline_qber = 0.02
    sample_count = 1000
    false_alarm_rate = 1e-9

    res = calculate_hoeffding_threshold(baseline_qber, sample_count, false_alarm_rate)

    # Manual delta calculation
    expected_delta = math.sqrt(math.log(1e9) / (2 * 1000))
    expected_threshold = min(1.0, baseline_qber + expected_delta)

    assert res.baseline_qber == 0.02
    assert res.sample_count == 1000
    assert res.false_alarm_rate == 1e-9
    assert abs(res.delta - expected_delta) < 1e-5
    assert abs(res.threshold - expected_threshold) < 1e-5
    assert not res.is_capped


def test_hoeffding_threshold_capping():
    """Tests threshold capping at 1.0 when sample size N is very small or noise is high."""
    res = calculate_hoeffding_threshold(baseline_qber=0.8, sample_count=2, false_alarm_rate=1e-9)

    assert res.threshold == 1.0
    assert res.is_capped
