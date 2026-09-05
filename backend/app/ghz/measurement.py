"""
GHZ Measurement Engine.

Executes projective measurements in requested basis configurations (Z for key extraction, X for parity verification).
Operates directly on the Qiskit quantum circuit backend to produce genuine simulated measurement counts.
"""

import logging
from typing import Dict, List, Optional

from app.ghz.circuit import create_ghz_circuit, simulate_ghz
from app.ghz.exceptions import GHZMeasurementError, InvalidBasisError
from app.ghz.models import GHZMeasurementResult, GHZStateStatus
from app.ghz.state import GHZState

logger = logging.getLogger("qds.ghz.measurement")

ALLOWED_BASES = {"Z", "X"}


def measure_ghz_state(
    state: GHZState,
    basis: Optional[List[str]] = None,
    shots: Optional[int] = None,
    noise_rate: Optional[float] = None,
    seed: Optional[int] = None,
) -> GHZMeasurementResult:
    """
    Perform quantum circuit measurement on the GHZ state across specified participant bases.

    Args:
        state: GHZState instance. Must have participants distributed.
        basis: List of 3 bases, e.g. ['Z', 'Z', 'Z'] or ['X', 'X', 'X']. Defaults to ['Z', 'Z', 'Z'].
        shots: Number of measurement repetitions. Defaults to state.shots.
        noise_rate: Noise rate for simulation. Defaults to state.noise_rate.
        seed: Random seed for deterministic testing.

    Returns:
        GHZMeasurementResult with raw counts and individual samples.
    """
    if basis is None:
        basis = ["Z", "Z", "Z"]

    if len(basis) != 3:
        raise GHZMeasurementError(f"Measurement basis must specify 3 bases for 3 qubits, got {len(basis)}.")

    normalized_basis = [b.upper().strip() for b in basis]
    for b in normalized_basis:
        if b not in ALLOWED_BASES:
            raise InvalidBasisError(b)

    num_shots = shots if shots is not None else state.shots
    effective_noise = noise_rate if noise_rate is not None else state.noise_rate

    # Generate and simulate quantum circuit
    qc = create_ghz_circuit(
        basis=normalized_basis,
        noise_rate=effective_noise,
        seed=seed,
    )

    counts, samples = simulate_ghz(
        qc=qc,
        shots=num_shots,
        noise_rate=effective_noise,
        seed=seed,
    )

    result = GHZMeasurementResult(
        ghz_id=state.ghz_id,
        basis=normalized_basis,
        shots=num_shots,
        raw_counts=counts,
        measured_samples=samples,
        participant_mapping=state.qubit_mapping,
    )

    state.measurement_result = result
    state.status = GHZStateStatus.MEASURED

    logger.info(
        "GHZ measurement completed for %s: basis=%s, shots=%d, unique_outcomes=%d",
        state.ghz_id,
        normalized_basis,
        num_shots,
        len(counts),
    )

    return result
