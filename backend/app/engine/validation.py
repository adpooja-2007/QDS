"""
Input Data Validation Engine (Feature M2-F01).
Strict validation of Alice/Bob telemetry without silent truncation or default fixups.
"""

from typing import Sequence
from app.engine.constants import VALID_BITS, VALID_BASES
from app.engine.exceptions import (
    InvalidBitSequenceError,
    InvalidBasisError,
    ArrayLengthMismatchError,
    InvalidParameterError,
)


def validate_bit_sequence(bits: Sequence[int], field_name: str = "bits") -> None:
    """Validates that all elements in the bit sequence are strictly 0 or 1."""
    if not isinstance(bits, (list, tuple)):
        raise InvalidBitSequenceError(f"Field '{field_name}' must be a sequence of 0s and 1s", field=field_name)
    
    for i, b in enumerate(bits):
        # Ensure it's boolean/int strictly 0 or 1, not strings or out-of-bound ints
        if isinstance(b, bool):
            continue
        if not isinstance(b, int) or b not in VALID_BITS:
            raise InvalidBitSequenceError(
                f"Field '{field_name}' contains invalid bit value '{b}' at index {i}. Only 0 and 1 are permitted.",
                field=field_name,
            )


def validate_basis_sequence(bases: Sequence[str], field_name: str = "bases") -> None:
    """Validates that all elements in the basis sequence are strictly 'Z' or 'X'."""
    if not isinstance(bases, (list, tuple)):
        raise InvalidBasisError(f"Field '{field_name}' must be a sequence of bases", field=field_name)

    for i, b in enumerate(bases):
        if not isinstance(b, str) or b not in VALID_BASES:
            raise InvalidBasisError(
                f"Field '{field_name}' contains invalid basis identifier '{b}' at index {i}. Only 'Z' and 'X' are permitted.",
                field=field_name,
            )


def validate_array_lengths(
    alice_bits: Sequence[int],
    alice_bases: Sequence[str],
    bob_bits: Sequence[int],
    bob_bases: Sequence[str],
) -> None:
    """
    Validates array length consistency.
    Strictly checks:
    len(alice.bits) == len(alice.bases)
    len(bob.bits) == len(bob.bases)
    len(alice.bits) == len(bob.bits)
    """
    na_bits = len(alice_bits)
    na_bases = len(alice_bases)
    nb_bits = len(bob_bits)
    nb_bases = len(bob_bases)

    if na_bits != na_bases:
        raise ArrayLengthMismatchError(
            f"Alice bits length ({na_bits}) does not match Alice bases length ({na_bases}).",
            field="alice.bases",
        )

    if nb_bits != nb_bases:
        raise ArrayLengthMismatchError(
            f"Bob bits length ({nb_bits}) does not match Bob bases length ({nb_bases}).",
            field="bob.bases",
        )

    if na_bits != nb_bits:
        raise ArrayLengthMismatchError(
            f"Alice telemetry length ({na_bits}) does not match Bob telemetry length ({nb_bits}).",
            field="bob.bits",
        )


def validate_security_parameters(baseline_qber: float, false_alarm_rate: float) -> None:
    """Validates baseline QBER and false alarm rate mathematical boundaries."""
    if not (0.0 <= baseline_qber <= 1.0):
        raise InvalidParameterError("baseline_qber must be between 0.0 and 1.0 inclusive", field="channel.baseline_qber")

    if not (0.0 < false_alarm_rate < 1.0):
        raise InvalidParameterError("false_alarm_rate must be strictly between 0.0 and 1.0 exclusive", field="security_parameters.false_alarm_rate")


def validate_security_input(
    alice_bits: Sequence[int],
    alice_bases: Sequence[str],
    bob_bits: Sequence[int],
    bob_bases: Sequence[str],
    baseline_qber: float = 0.02,
    false_alarm_rate: float = 1e-9,
) -> None:
    """Orchestrates all validations on quantum input telemetry."""
    validate_bit_sequence(alice_bits, "alice.bits")
    validate_basis_sequence(alice_bases, "alice.bases")
    validate_bit_sequence(bob_bits, "bob.bits")
    validate_basis_sequence(bob_bases, "bob.bases")
    validate_array_lengths(alice_bits, alice_bases, bob_bits, bob_bases)
    validate_security_parameters(baseline_qber, false_alarm_rate)
