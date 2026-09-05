"""
GHZ + QuARC Integration Adapter.

Bridges QuARC quantum adaptive path selection with GHZ multipartite entanglement distribution.
Allows quantum route discovery without polluting GHZ circuits with routing graph mechanics,
and without polluting QuARC topology with quantum circuit logic.
"""

import logging
from typing import Any, Dict, List, Optional

from app.ghz.models import GHZMeasurementResult, GHZVerificationResult
from app.ghz.service import GHZService, ghz_service
from app.ghz.state import GHZState
from app.quarc.models import RouteConstraint, RoutingDecision
from app.quarc.service import QuARCService, quarc_service

logger = logging.getLogger("qds.integration.ghz_quarc")


class GHZQuARCAdapter:
    """
    Adapter orchestrating multi-party quantum network routing and GHZ state distribution.
    """

    def __init__(
        self,
        ghz_svc: Optional[GHZService] = None,
        quarc_svc: Optional[QuARCService] = None,
    ):
        self.ghz_service = ghz_svc or ghz_service
        self.quarc_service = quarc_svc or quarc_service

    def route_and_distribute_ghz(
        self,
        participants: List[str],
        coordinator: Optional[str] = None,
        constraints: Optional[RouteConstraint] = None,
        shots: int = 1000,
        noise_rate: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Orchestrate routing from coordinator to other participants, then establish 3-party GHZ state.

        1. Select routes from coordinator (default: participants[0]) to the remaining 2 participants.
        2. Compute aggregate route fidelity.
        3. Create and distribute 3-qubit GHZ state.
        4. Store routing decisions in GHZ state metadata.
        """
        if len(participants) != 3:
            raise ValueError(f"GHZ distribution requires exactly 3 participants, got {len(participants)}")

        coord = coordinator or participants[0]
        other_participants = [p for p in participants if p != coord]

        routing_decisions: Dict[str, RoutingDecision] = {}
        route_fidelities = []

        # Find routes from coordinator to other nodes
        for target in other_participants:
            try:
                decision = self.quarc_service.select_route(
                    source=coord,
                    destination=target,
                    constraints=constraints,
                )
                routing_decisions[target] = decision
                route_fidelities.append(decision.metrics.end_to_end_fidelity)
            except Exception as exc:
                logger.warning("Could not compute route from %s to %s: %s", coord, target, exc)

        # Effective channel noise is directly parameterized by caller
        effective_noise = noise_rate
        avg_fid = sum(route_fidelities) / len(route_fidelities) if route_fidelities else 1.0

        # Create and distribute GHZ state
        state = self.ghz_service.create_state(
            participants=participants,
            shots=shots,
            noise_rate=effective_noise,
            metadata={
                "coordinator": coord,
                "routing_decisions": {
                    target: dec.to_dict() for target, dec in routing_decisions.items()
                },
                "average_route_fidelity": round(avg_fid, 4),
                "effective_channel_noise": round(effective_noise, 4),
            },
        )

        return {
            "ghz_id": state.ghz_id,
            "participants": state.participants,
            "qubit_mapping": state.qubit_mapping,
            "coordinator": coord,
            "routing_paths": {
                target: dec.selected_path for target, dec in routing_decisions.items()
            },
            "routes_evaluated": len(routing_decisions),
            "effective_noise": effective_noise,
            "status": state.status.value,
        }

    def measure_and_verify_session(
        self,
        ghz_id: str,
        basis: Optional[List[str]] = None,
        threshold: float = 0.05,
    ) -> Dict[str, Any]:
        """
        Execute measurement and statistical verification on a distributed GHZ state.
        """
        measurement = self.ghz_service.measure(ghz_id, basis=basis)
        verification = self.ghz_service.verify(measurement, threshold=threshold)

        return {
            "ghz_id": ghz_id,
            "basis": measurement.basis,
            "total_shots": measurement.shots,
            "valid_measurements": verification.valid_measurements,
            "error_count": verification.error_count,
            "error_rate": verification.error_rate,
            "qber": verification.qber,
            "parity_passed": verification.parity_passed,
            "verified": verification.verified,
            "verdict": verification.decision.value,
            "raw_counts": measurement.raw_counts,
        }


# Global singleton adapter instance
ghz_quarc_adapter = GHZQuARCAdapter()
