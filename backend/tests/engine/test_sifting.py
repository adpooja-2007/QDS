"""
Unit tests for Basis Reconciliation (M2-F02) and Base Sifting (M2-F03).
"""

from app.engine.sifting import reconcile_and_sift_bases


def test_sifting_example_from_spec():
    """Tests the exact sifting example provided in specification section 9 & 10."""
    alice_bits = [0, 1, 1, 0, 1, 0, 1, 1]
    alice_bases = ["Z", "X", "Z", "X", "Z", "Z", "X", "X"]

    bob_bits = [0, 1, 1, 1, 1, 0, 0, 1]
    bob_bases = ["Z", "X", "Z", "Z", "Z", "Z", "X", "X"]

    sift = reconcile_and_sift_bases(alice_bits, alice_bases, bob_bits, bob_bases)

    assert sift.total_bits == 8
    assert sift.matching_bits == 7
    assert sift.discarded_bits == 1
    assert sift.sifting_ratio == 0.875
    assert sift.matching_indices == [0, 1, 2, 4, 5, 6, 7]
    assert sift.discarded_indices == [3]

    assert sift.alice_sifted_bits == [0, 1, 1, 1, 0, 1, 1]
    assert sift.bob_sifted_bits == [0, 1, 1, 1, 0, 0, 1]


def test_all_bases_matching():
    """Test scenario where 100% of bases match."""
    alice_bits = [1, 0, 1]
    alice_bases = ["Z", "Z", "X"]
    bob_bits = [1, 0, 0]
    bob_bases = ["Z", "Z", "X"]

    sift = reconcile_and_sift_bases(alice_bits, alice_bases, bob_bits, bob_bases)
    assert sift.matching_bits == 3
    assert sift.discarded_bits == 0
    assert sift.sifting_ratio == 1.0


def test_zero_bases_matching():
    """Test scenario where 0% of bases match."""
    alice_bits = [1, 0, 1]
    alice_bases = ["Z", "Z", "Z"]
    bob_bits = [1, 0, 0]
    bob_bases = ["X", "X", "X"]

    sift = reconcile_and_sift_bases(alice_bits, alice_bases, bob_bits, bob_bases)
    assert sift.matching_bits == 0
    assert sift.discarded_bits == 3
    assert sift.sifting_ratio == 0.0
    assert sift.alice_sifted_bits == []
    assert sift.bob_sifted_bits == []
