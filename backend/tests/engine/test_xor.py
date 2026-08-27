"""
Unit tests for XOR Match Evaluation (Feature M2-F04) & Mismatch Counter (M2-F05).
"""

from app.engine.xor_evaluator import evaluate_xor_matches


def test_xor_example_from_spec():
    """Tests the exact XOR example from specification section 12."""
    alice_sifted = [0, 1, 1, 1, 0, 1, 1]
    bob_sifted = [0, 1, 1, 1, 0, 0, 1]

    res = evaluate_xor_matches(alice_sifted, bob_sifted)

    assert res.mismatch_bits == [0, 0, 0, 0, 0, 1, 0]
    assert res.mismatch_count == 1
    assert res.match_count == 6
    assert res.total_compared == 7


def test_xor_perfect_match():
    """Test XOR on identical bit arrays."""
    alice_sifted = [1, 0, 1, 1]
    bob_sifted = [1, 0, 1, 1]

    res = evaluate_xor_matches(alice_sifted, bob_sifted)
    assert res.mismatch_count == 0
    assert res.match_count == 4
    assert sum(res.mismatch_bits) == 0


def test_xor_complete_mismatch():
    """Test XOR on completely inverted bit arrays."""
    alice_sifted = [1, 0, 1, 0]
    bob_sifted = [0, 1, 0, 1]

    res = evaluate_xor_matches(alice_sifted, bob_sifted)
    assert res.mismatch_count == 4
    assert res.match_count == 0
