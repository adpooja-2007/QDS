"""
Quantum Network Session Adapter.

Provides end-to-end orchestration for establishing multi-party quantum sessions:
Topology -> QuARC Routing -> GHZ State Distribution -> Measurement -> Statistical Verification.
"""

import logging
import uuid
from typing import Any, Dict, List, Optional

from app.integration.ghz_quarc_adapter import GHZQuARCAdapter, ghz_quarc_adapter
from app.quarc.models import RouteConstraint

logger = logging.getLogger("qds.integration.network")


class QuantumNetworkAdapter:
    """
    High-level adapter managing multi-party quantum networking sessions.
    """

    def __init__(self, adapter: Optional[GHZQuARCAdapter] = None):
        self.adapter = adapter or ghz_quarc_adapter

    def establish_quantum_session(
        self,
        participants: List[str],
        coordinator: Optional[str] = None,
        basis: Optional[List[str]] = None,
        constraints: Optional[RouteConstraint] = None,
        shots: int = 1000,
        threshold: float = 0.05,
    ) -> Dict[str, Any]:
        """
        Execute full quantum network pipeline:
        1. Discover multi-party routes using QuARC.
        2. Prepare & distribute 3-qubit GHZ state across selected network paths.
        3. Perform quantum projective measurement.
        4. Derive QBER and statistical parity verification.
        """
        session_id = f"QNET-{uuid.uuid4().hex[:8].upper()}"

        # Step 1 & 2: Routing and GHZ distribution
        dist_res = self.adapter.route_and_distribute_ghz(
            participants=participants,
            coordinator=coordinator,
            constraints=constraints,
            shots=shots,
        )

        ghz_id = dist_res["ghz_id"]

        # Step 3 & 4: Measurement and Verification
        measure_basis = basis or ["Z", "Z", "Z"]
        verif_res = self.adapter.measure_and_verify_session(
            ghz_id=ghz_id,
            basis=measure_basis,
            threshold=threshold,
        )

        logger.info(
            "Quantum session %s established for %s (GHZ=%s, Verdict=%s)",
            session_id,
            participants,
            ghz_id,
            verif_res["verdict"],
        )

        return {
            "session_id": session_id,
            "ghz_id": ghz_id,
            "participants": participants,
            "coordinator": dist_res["coordinator"],
            "routing_paths": dist_res["routing_paths"],
            "measurement_basis": measure_basis,
            "shots": shots,
            "valid_measurements": verif_res["valid_measurements"],
            "error_count": verif_res["error_count"],
            "qber": verif_res["qber"],
            "parity_passed": verif_res["parity_passed"],
            "verified": verif_res["verified"],
            "status": "COMPLETED" if verif_res["verified"] else "VERIFICATION_FAILED",
            "raw_counts": verif_res["raw_counts"],
        }


# Global singleton network adapter instance
quantum_network_adapter = QuantumNetworkAdapter()
