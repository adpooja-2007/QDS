"""
Candidate Path Generation and Ranking.
"""

import logging
from typing import List, Optional

from app.quarc.metrics import evaluate_path_metrics
from app.quarc.models import CandidatePath, RouteConstraint
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.path")


def find_candidate_paths(
    topology: QuantumTopology,
    source: str,
    destination: str,
    constraints: Optional[RouteConstraint] = None,
    max_candidates: int = 10,
    max_hops: int = 10,
    available_only: bool = True,
) -> List[CandidatePath]:
    """
    Discover multiple candidate quantum routes between source and destination and evaluate their metrics.
    """
    c = constraints or RouteConstraint()
    raw_paths = topology.find_paths(
        source=source,
        destination=destination,
        max_hops=min(max_hops, c.max_hops),
        available_only=available_only,
    )

    candidates: List[CandidatePath] = []

    for path in raw_paths:
        metrics = evaluate_path_metrics(path, topology)
        is_valid = True
        rejection_reasons = []

        # Validate against constraints
        if metrics.end_to_end_fidelity < c.min_fidelity:
            is_valid = False
            rejection_reasons.append(f"Fidelity {metrics.end_to_end_fidelity:.3f} < min {c.min_fidelity}")
        if metrics.total_latency_ms > c.max_latency:
            is_valid = False
            rejection_reasons.append(f"Latency {metrics.total_latency_ms:.1f}ms > max {c.max_latency}ms")
        if metrics.overall_reliability < c.min_reliability:
            is_valid = False
            rejection_reasons.append(f"Reliability {metrics.overall_reliability:.3f} < min {c.min_reliability}")
        if metrics.bottleneck_capacity < c.min_capacity:
            is_valid = False
            rejection_reasons.append(f"Capacity {metrics.bottleneck_capacity} < min {c.min_capacity}")
        if metrics.avg_error_rate > c.max_error_rate:
            is_valid = False
            rejection_reasons.append(f"Error rate {metrics.avg_error_rate:.3f} > max {c.max_error_rate}")

        candidates.append(
            CandidatePath(
                path_nodes=path,
                metrics=metrics,
                is_valid=is_valid,
                rejection_reason="; ".join(rejection_reasons) if rejection_reasons else None,
            )
        )

    # Rank candidate paths by score (highest first)
    candidates.sort(key=lambda cp: (cp.is_valid, cp.metrics.score), reverse=True)
    return candidates[:max_candidates]
