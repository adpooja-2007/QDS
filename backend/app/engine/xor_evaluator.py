"""
XOR Match Evaluation (M2-F04) & Mismatch Counter (M2-F05) Engine.
"""

from typing import Sequence
import numpy as np
from app.models.output_models import XORResult


def evaluate_xor_matches(
    alice_sifted_bits: Sequence[int],
    bob_sifted_bits: Sequence[int],
) -> XORResult:
    """
    Computes bitwise XOR between Alice's and Bob's sifted bits:
    M_i = A_i XOR B_i
    Returns mismatch bit array, mismatch count, match count, and total compared.
    """
    total_compared = len(alice_sifted_bits)
    if total_compared == 0:
        return XORResult(
            mismatch_bits=[],
            mismatch_count=0,
            match_count=0,
            total_compared=0,
        )

    a_arr = np.array(alice_sifted_bits, dtype=np.int8)
    b_arr = np.array(bob_sifted_bits, dtype=np.int8)

    mismatch_arr = np.bitwise_xor(a_arr, b_arr)
    mismatch_bits = mismatch_arr.tolist()
    mismatch_count = int(np.sum(mismatch_arr))
    match_count = total_compared - mismatch_count

    return XORResult(
        mismatch_bits=mismatch_bits,
        mismatch_count=mismatch_count,
        match_count=match_count,
        total_compared=total_compared,
    )
