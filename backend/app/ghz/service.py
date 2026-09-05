"""
GHZ Service - Public interface for 3-qubit quantum entanglement operations.

Provides a clean, standalone, decoupled facade for creating, distributing,
measuring, and verifying GHZ states without exposing internal Qiskit mechanics.
"""

import logging
from typing import Any, Dict, List, Optional, Union

from app.ghz.distribution import distribute_ghz_state
from app.ghz.exceptions import GHZError, GHZVerificationError
from app.ghz.measurement import measure_ghz_state
from app.ghz.models import (
    GHZMeasurementResult,
    GHZStateStatus,
    GHZVerificationResult,
)
from app.ghz.state import GHZState
from app.ghz.verification import verify_ghz_measurement, verify_ghz_state

logger = logging.getLogger("qds.ghz.service")


class GHZService:
    """
    Standalone public service managing 3-qubit GHZ state lifecycle.

    Maintains an in-memory registry of active states, fully independent from FastAPI or database engines.
    """

    def __init__(self):
        self._states: Dict[str, GHZState] = {}

    def create_state(
        self,
        participants: Optional[List[str]] = None,
        shots: int = 1000,
        noise_rate: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GHZState:
        """
        Create a new 3-qubit GHZ entanglement state instance.

        If participants are provided (must be 3 distinct names), distribution is performed immediately.
        """
        state = GHZState(
            shots=shots,
            noise_rate=noise_rate,
            metadata=metadata or {},
        )

        if participants:
            distribute_ghz_state(state, participants)

        self._states[state.ghz_id] = state
        logger.info("Created GHZ state: %s (status=%s)", state.ghz_id, state.status.value)
        return state

    def get_state(self, ghz_id: str) -> GHZState:
        """Retrieve a GHZ state by its identifier."""
        if ghz_id not in self._states:
            raise GHZError(f"GHZ state not found: {ghz_id}")
        return self._states[ghz_id]

    def list_states(self) -> List[GHZState]:
        """List all managed GHZ states."""
        return list(self._states.values())

    def distribute(
        self,
        ghz_id: str,
        participants: List[str],
    ) -> Dict[int, str]:
        """Distribute an existing GHZ state to 3 participants."""
        state = self.get_state(ghz_id)
        return distribute_ghz_state(state, participants)

    def measure(
        self,
        target: Union[GHZState, str],
        basis: Optional[List[str]] = None,
        shots: Optional[int] = None,
        noise_rate: Optional[float] = None,
        seed: Optional[int] = None,
    ) -> GHZMeasurementResult:
        """
        Measure the GHZ state across specified participant bases.
        Target can be a GHZState instance or state ID.
        """
        state = target if isinstance(target, GHZState) else self.get_state(target)
        return measure_ghz_state(
            state=state,
            basis=basis,
            shots=shots,
            noise_rate=noise_rate,
            seed=seed,
        )

    def verify(
        self,
        target: Union[GHZState, GHZMeasurementResult, str],
        threshold: float = 0.05,
    ) -> GHZVerificationResult:
        """
        Verify GHZ measurement results against theoretical correlations and error threshold.
        Target can be a GHZState, GHZMeasurementResult, or state ID.
        """
        if isinstance(target, GHZMeasurementResult):
            return verify_ghz_measurement(target, threshold=threshold)
        elif isinstance(target, GHZState):
            return verify_ghz_state(target, threshold=threshold)
        elif isinstance(target, str):
            state = self.get_state(target)
            return verify_ghz_state(state, threshold=threshold)
        else:
            raise GHZVerificationError(f"Unsupported verification target type: {type(target)}")

    def calculate_qber(
        self,
        target: Union[GHZState, GHZMeasurementResult, str],
    ) -> Dict[str, Any]:
        """Calculate Quantum Bit Error Rate for a measured GHZ state."""
        verification = self.verify(target)
        return {
            "ghz_id": verification.ghz_id,
            "total_measurements": verification.total_measurements,
            "valid_measurements": verification.valid_measurements,
            "error_count": verification.error_count,
            "error_rate": verification.error_rate,
            "qber": verification.qber,
            "qber_percentage": round(verification.qber * 100, 4),
            "parity_passed": verification.parity_passed,
            "verified": verification.verified,
        }


# Global singleton service instance
ghz_service = GHZService()
