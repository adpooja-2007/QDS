"""
Unit tests for Input Validation (Feature M2-F01).
"""

import pytest
from app.engine.exceptions import (
    InvalidBitSequenceError,
    InvalidBasisError,
    ArrayLengthMismatchError,
    InvalidParameterError,
)
from app.engine.validation import validate_security_input


def test_valid_input_passes():
    """Test that valid input telemetry passes without raising exceptions."""
    alice_bits = [0, 1, 1, 0]
    alice_bases = ["Z", "X", "Z", "X"]
    bob_bits = [0, 1, 0, 0]
    bob_bases = ["Z", "X", "Z", "X"]

    # Should not raise any error
    validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases)


def test_invalid_bit_value_raises():
    """Test that non-binary bit values raise InvalidBitSequenceError."""
    alice_bits = [0, 2, 1, 0]  # 2 is invalid
    alice_bases = ["Z", "X", "Z", "X"]
    bob_bits = [0, 1, 0, 0]
    bob_bases = ["Z", "X", "Z", "X"]

    with pytest.raises(InvalidBitSequenceError) as exc_info:
        validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases)
    assert exc_info.value.code == "INVALID_BIT_VALUE"


def test_invalid_basis_value_raises():
    """Test that non-Z/X bases raise InvalidBasisError."""
    alice_bits = [0, 1, 1, 0]
    alice_bases = ["Z", "Y", "Z", "X"]  # 'Y' is invalid
    bob_bits = [0, 1, 0, 0]
    bob_bases = ["Z", "X", "Z", "X"]

    with pytest.raises(InvalidBasisError) as exc_info:
        validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases)
    assert exc_info.value.code == "INVALID_BASIS_VALUE"


def test_array_length_mismatch_raises():
    """Test that array length mismatch raises ArrayLengthMismatchError."""
    alice_bits = [0, 1, 1, 0, 1]  # length 5
    alice_bases = ["Z", "X", "Z", "X", "Z"]
    bob_bits = [0, 1, 0, 0]  # length 4
    bob_bases = ["Z", "X", "Z", "X"]

    with pytest.raises(ArrayLengthMismatchError) as exc_info:
        validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases)
    assert exc_info.value.code == "ARRAY_LENGTH_MISMATCH"


def test_invalid_security_parameters_raises():
    """Test that out-of-range security parameters raise InvalidParameterError."""
    alice_bits = [0, 1]
    alice_bases = ["Z", "X"]
    bob_bits = [0, 1]
    bob_bases = ["Z", "X"]

    with pytest.raises(InvalidParameterError):
        validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases, baseline_qber=1.5)

    with pytest.raises(InvalidParameterError):
        validate_security_input(alice_bits, alice_bases, bob_bits, bob_bases, false_alarm_rate=0.0)
