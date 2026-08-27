"""
Unit tests for Helstrom Minimum Error Bound engine (Helstrom state discrimination).
"""

from app.engine.helstrom import evaluate_helstrom_bound


def test_helstrom_bound_orthogonal_states():
    """For orthogonal states (overlap gamma = 0), trace distance = 1, min error = 0."""
    res = evaluate_helstrom_bound(overlap_gamma=0.0)
    assert res.trace_distance == 1.0
    assert res.min_error_probability == 0.0
    assert res.max_fidelity == 1.0


def test_helstrom_bound_identical_states():
    """For identical states (overlap gamma = 1), trace distance = 0, min error = 0.5 (random guess)."""
    res = evaluate_helstrom_bound(overlap_gamma=1.0)
    assert res.trace_distance == 0.0
    assert res.min_error_probability == 0.5
    assert res.max_fidelity == 0.5


def test_helstrom_bound_standard_bb84_overlap():
    """For standard BB84 non-orthogonal overlap gamma = 1/sqrt(2) approx 0.70710678."""
    res = evaluate_helstrom_bound(overlap_gamma=0.70710678)
    assert res.trace_distance == 0.707107
    assert round(res.min_error_probability, 3) == 0.146
    assert res.status == "BOUND_ENFORCED"
