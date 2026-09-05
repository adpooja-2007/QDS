"""
QuARC Adaptive Path Selector.

Selects optimal quantum routes based on multi-metric evaluation and user constraints.
Returns explainable decision records.
"""

import logging
import uuid
from typing import List, Optional

from app.quarc.exceptions import RouteNotFound
from app.quarc.models import RouteConstraint, RoutingDecision
from app.quarc.path import find_candidate_paths
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.selector")


class AdaptivePathSelector:
    """
    Selects the best viable quantum route from candidate paths according to current network state.
    """

    def __init__(self, topology: QuantumTopology):
        self.topology = topology

    def select_path(
        self,
        source: str,
        destination: str,
        constraints: Optional[RouteConstraint] = None,
        max_hops: int = 10,
    ) -> RoutingDecision:
        """
        Evaluate candidate routes and select the optimal path meeting constraints.

        Raises:
            RouteNotFound: if no valid route exists.
        """
        c = constraints or RouteConstraint()
        candidates = find_candidate_paths(
            topology=self.topology,
            source=source,
            destination=destination,
            constraints=c,
            max_hops=max_hops,
            available_only=True,
        )

        if not candidates:
            raise RouteNotFound(source, destination, "No connected path exists in active topology.")

        valid_candidates = [cp for cp in candidates if cp.is_valid]

        if not valid_candidates:
            # Build detailed explanation of constraint rejections
            rejection_details = [
                f"Path {cp.path_nodes}: {cp.rejection_reason}" for cp in candidates[:3]
            ]
            raise RouteNotFound(
                source,
                destination,
                f"Candidate paths failed constraints: {'; '.join(rejection_details)}",
            )

        best_candidate = valid_candidates[0]
        decision_id = f"ROUTE-{uuid.uuid4().hex[:10].upper()}"

        reason = (
            f"Selected optimal route based on composite score {best_candidate.metrics.score:.4f} "
            f"(Fidelity={best_candidate.metrics.end_to_end_fidelity:.4f}, "
            f"Latency={best_candidate.metrics.total_latency_ms:.1f}ms, "
            f"Reliability={best_candidate.metrics.overall_reliability:.4f}, "
            f"Hops={best_candidate.metrics.hop_count}) across {len(valid_candidates)} valid candidate(s)."
        )

        decision = RoutingDecision(
            decision_id=decision_id,
            source=source,
            destination=destination,
            selected_path=best_candidate.path_nodes,
            score=best_candidate.metrics.score,
            metrics=best_candidate.metrics,
            candidate_count=len(candidates),
            candidates=candidates,
            reason=reason,
        )

        logger.info(
            "Selected route %s -> %s: %s (score=%.4f, fidelity=%.4f)",
            source,
            destination,
            best_candidate.path_nodes,
            best_candidate.metrics.score,
            best_candidate.metrics.end_to_end_fidelity,
        )

        return decision
