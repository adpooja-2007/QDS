"""
Basis Reconciliation (M2-F02) and Base Sifting (M2-F03) Engine.
Uses NumPy vectorization for performance.
"""

from typing import Sequence
import numpy as np
from app.models.output_models import SiftingResult


def reconcile_and_sift_bases(
    alice_bits: Sequence[int],
    alice_bases: Sequence[str],
    bob_bits: Sequence[int],
    bob_bases: Sequence[str],
) -> SiftingResult:
    """
    Performs basis reconciliation and base sifting.
    Identifies matching bases between Alice and Bob, removes mismatched positions,
    and returns sifted bit strings and sifting metrics.
    """
    total_bits = len(alice_bits)
    if total_bits == 0:
        return SiftingResult(
            total_bits=0,
            matching_bits=0,
            discarded_bits=0,
            sifting_ratio=0.0,
            matching_indices=[],
            discarded_indices=[],
            alice_sifted_bits=[],
            bob_sifted_bits=[],
        )

    # Convert to NumPy arrays for fast comparison
    a_bases = np.array(alice_bases)
    b_bases = np.array(bob_bases)
    a_bits = np.array(alice_bits, dtype=np.int8)
    b_bits = np.array(bob_bits, dtype=np.int8)

    # Find matching boolean mask
    matching_mask = (a_bases == b_bases)

    matching_indices = np.where(matching_mask)[0].tolist()
    discarded_indices = np.where(~matching_mask)[0].tolist()

    alice_sifted = a_bits[matching_mask].tolist()
    bob_sifted = b_bits[matching_mask].tolist()

    matching_bits = len(matching_indices)
    discarded_bits = len(discarded_indices)
    sifting_ratio = matching_bits / total_bits if total_bits > 0 else 0.0

    return SiftingResult(
        total_bits=total_bits,
        matching_bits=matching_bits,
        discarded_bits=discarded_bits,
        sifting_ratio=round(sifting_ratio, 6),
        matching_indices=matching_indices,
        discarded_indices=discarded_indices,
        alice_sifted_bits=alice_sifted,
        bob_sifted_bits=bob_sifted,
    )
