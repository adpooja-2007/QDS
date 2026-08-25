"""
Unit tests for QBER Calculator (Feature M2-F06).
"""

from app.engine.qber import calculate_qber


def test_qber_example_from_spec():
    """Tests exact QBER example from section 14 & 15 (1 error / 7 bits = 14.2857%)."""
    res = calculate_qber(mismatch_count=1, sample_count=7)

    assert res.status == "COMPLETED"
    assert res.qber == 0.142857
    assert res.qber_percentage == 14.2857
    assert res.error_count == 1
    assert res.sample_count == 7


def test_zero_sifted_bits_edge_case():
    """Tests zero sifted bits edge case handling (section 16)."""
    res = calculate_qber(mismatch_count=0, sample_count=0)

    assert res.qber is None
    assert res.qber_percentage is None
    assert res.status == "INSUFFICIENT_DATA"
    assert res.error_code == "NO_SIFTED_BITS"


def test_zero_errors_qber():
    """Tests 0 errors out of N sample bits."""
    res = calculate_qber(mismatch_count=0, sample_count=1000)
    assert res.qber == 0.0
    assert res.qber_percentage == 0.0
