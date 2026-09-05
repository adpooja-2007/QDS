"""
GHZ Verification and Statistical Analysis Engine.

Consumes genuine measurement counts from Qiskit execution to evaluate:
1. Z-basis bit correlations (|000⟩ and |111⟩ matching).
2. X-basis parity verification (even parity: b0 ⊕ b1 ⊕ b2 = 0).
3. Quantum Bit Error Rate (QBER) and threshold-based decision gating.
"""

import logging
from typing import Any, Dict, List, Optional

from app.ghz.exceptions import GHZVerificationError
from app.ghz.models import (
    GHZMeasurementResult,
    GHZStateStatus,
    GHZVerificationDecision,
    GHZVerificationResult,
)
from app.ghz.state import GHZState

logger = logging.getLogger("qds.ghz.verification")

DEFAULT_QBER_THRESHOLD = 0.05


def verify_z_basis(
    counts: Dict[str, int],
    total_shots: int,
    threshold: float = DEFAULT_QBER_THRESHOLD,
) -> Dict[str, Any]:
    """
    Verify Z-basis measurement correlations.
    In an ideal 3-qubit GHZ state (|000⟩ + |111⟩)/√2:
    - Expected outcomes: '000' and '111' (perfect correlation across all 3 participants).
    - Errors: any outcome where participants disagree ('001', '010', '011', '100', '101', '110').
    """
    valid_count = counts.get("000", 0) + counts.get("111", 0)
    error_count = total_shots - valid_count
    error_rate = error_count / total_shots if total_shots > 0 else 0.0
    qber = error_rate

    passed = error_rate <= threshold

    return {
        "valid_count": valid_count,
        "error_count": error_count,
        "error_rate": round(error_rate, 6),
        "qber": round(qber, 6),
        "parity_passed": True,  # Parity is specific to X-basis
        "passed": passed,
        "expected_outcomes": ["000", "111"],
        "observed_counts": counts,
    }


def verify_x_basis(
    counts: Dict[str, int],
    total_shots: int,
    threshold: float = DEFAULT_QBER_THRESHOLD,
) -> Dict[str, Any]:
    """
    Verify X-basis measurement parity.
    Under Hadamard transformation on all 3 qubits:
        H^⊗3 (|000⟩ + |111⟩)/√2 = 1/2 (|000⟩ + |011⟩ + |101⟩ + |110⟩)
    
    Expected outcomes have EVEN PARITY (b0 ⊕ b1 ⊕ b2 = 0):
        '000', '011', '101', '110'.
    
    Errors are any outcomes with ODD PARITY (b0 ⊕ b1 ⊕ b2 = 1):
        '001', '010', '100', '111'.
    """
    even_parity_count = 0
    odd_parity_count = 0

    for bitstring, count in counts.items():
        # Calculate parity: sum of bits modulo 2
        bits = [int(b) for b in bitstring]
        parity = sum(bits) % 2
        if parity == 0:
            even_parity_count += count
        else:
            odd_parity_count += count

    error_rate = odd_parity_count / total_shots if total_shots > 0 else 0.0
    qber = error_rate
    parity_passed = error_rate <= threshold

    return {
        "valid_count": even_parity_count,
        "error_count": odd_parity_count,
        "error_rate": round(error_rate, 6),
        "qber": round(qber, 6),
        "parity_passed": parity_passed,
        "passed": parity_passed,
        "expected_outcomes": ["000", "011", "101", "110"],
        "even_parity_count": even_parity_count,
        "odd_parity_count": odd_parity_count,
        "observed_counts": counts,
    }


def verify_ghz_measurement(
    measurement: GHZMeasurementResult,
    threshold: float = DEFAULT_QBER_THRESHOLD,
) -> GHZVerificationResult:
    """
    Verify quantum measurement outcomes against theoretical expectations.

    Args:
        measurement: GHZMeasurementResult containing actual simulation counts.
        threshold: Maximum allowable error rate (QBER) for verification acceptance.

    Returns:
        GHZVerificationResult with explicit metrics and verdict.
    """
    if measurement.shots <= 0:
        raise GHZVerificationError("Measurement contains zero shots.")

    basis = measurement.basis
    counts = measurement.raw_counts
    total_shots = measurement.shots

    if basis == ["Z", "Z", "Z"]:
        analysis = verify_z_basis(counts, total_shots, threshold)
    elif basis == ["X", "X", "X"]:
        analysis = verify_x_basis(counts, total_shots, threshold)
    else:
        # Generic mixed basis parity/correlation analysis
        # For arbitrary bases, check bit parity where X is measured, correlation where Z is measured
        total_errors = 0
        for bitstring, count in counts.items():
            # Apply individual qubit expectation check
            bits = [int(b) for b in bitstring]
            # Simple heuristic for mixed basis verification
            if sum(bits) % 2 != 0:
                total_errors += count
        error_rate = total_errors / total_shots if total_shots > 0 else 0.0
        analysis = {
            "valid_count": total_shots - total_errors,
            "error_count": total_errors,
            "error_rate": round(error_rate, 6),
            "qber": round(error_rate, 6),
            "parity_passed": error_rate <= threshold,
            "passed": error_rate <= threshold,
            "expected_outcomes": ["Mixed basis"],
            "observed_counts": counts,
        }

    decision = GHZVerificationDecision.PASS if analysis["passed"] else GHZVerificationDecision.FAIL

    result = GHZVerificationResult(
        ghz_id=measurement.ghz_id,
        basis=measurement.basis,
        total_measurements=total_shots,
        valid_measurements=analysis["valid_count"],
        error_count=analysis["error_count"],
        error_rate=analysis["error_rate"],
        qber=analysis["qber"],
        parity_passed=analysis["parity_passed"],
        verified=analysis["passed"],
        decision=decision,
        threshold=threshold,
        details=analysis,
    )

    logger.info(
        "GHZ verification for %s: basis=%s, errors=%d/%d (%.2f%%), QBER=%.4f, verdict=%s",
        measurement.ghz_id,
        measurement.basis,
        analysis["error_count"],
        total_shots,
        analysis["error_rate"] * 100,
        analysis["qber"],
        decision.value,
    )

    return result


def verify_ghz_state(
    state: GHZState,
    threshold: float = DEFAULT_QBER_THRESHOLD,
) -> GHZVerificationResult:
    """
    Verify state's measurement result and update state status.
    """
    if state.measurement_result is None:
        raise GHZVerificationError(f"Cannot verify GHZ state {state.ghz_id}: No measurement recorded.")

    result = verify_ghz_measurement(state.measurement_result, threshold=threshold)
    state.verification_result = result
    state.status = GHZStateStatus.VERIFIED if result.verified else GHZStateStatus.FAILED

    return result
