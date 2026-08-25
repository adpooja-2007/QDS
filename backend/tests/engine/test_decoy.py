"""
Unit tests for Decoy-State Statistics Evaluator (Feature M2-F12).
"""

from app.models.enums import DecoyStatus
from app.models.input_models import DecoyStateData, SingleStateCount
from app.engine.decoy import evaluate_decoy_statistics


def test_decoy_normal():
    """Tests normal decoy state behavior with matching error rates."""
    decoy_data = DecoyStateData(
        enabled=True,
        signal=SingleStateCount(sent=10000, detected=9500, errors=190),  # 2.0%
        decoy=SingleStateCount(sent=3000, detected=2850, errors=60),     # ~2.1%
    )
    res = evaluate_decoy_statistics(decoy_data)

    assert res.status == DecoyStatus.NORMAL
    assert abs(res.signal_error_rate - 0.02) < 1e-4


def test_decoy_anomalous():
    """Tests anomalous decoy state behavior with large error discrepancy."""
    decoy_data = DecoyStateData(
        enabled=True,
        signal=SingleStateCount(sent=10000, detected=9500, errors=190),  # 2.0%
        decoy=SingleStateCount(sent=3000, detected=2850, errors=285),   # 10.0%
    )
    res = evaluate_decoy_statistics(decoy_data)

    assert res.status == DecoyStatus.ANOMALOUS
    assert abs(res.error_rate_difference - 0.08) < 1e-4
