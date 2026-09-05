"""
QuARC Quantum Routing Metrics Evaluator.

Calculates quantum-physical and network metrics for candidate paths:
- Hop count & physical distance
- End-to-end fidelity: Product of link fidelities (F_e2e = ∏ F_i)
- Channel latency: Sum of link latencies (L_total = ∑ L_i)
- Reliability: Product of link success probabilities and non-error rates (R = ∏ p_i * (1 - e_i))
- Bottleneck capacity: Min link capacity along path (C_min = min C_i)
- Explicit composite ranking score with transparent weights
"""

import logging
from typing import List

from app.quarc.models import PathMetrics
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.metrics")

# Default explicit metric weighting constants
WEIGHT_FIDELITY = 0.40
WEIGHT_RELIABILITY = 0.30
WEIGHT_LATENCY = 0.20
WEIGHT_HOPS = 0.10
LATENCY_NORMALIZATION_BASE = 50.0  # ms
HOPS_NORMALIZATION_BASE = 10.0


def evaluate_path_metrics(
    path: List[str],
    topology: QuantumTopology,
    w_fid: float = WEIGHT_FIDELITY,
    w_rel: float = WEIGHT_RELIABILITY,
    w_lat: float = WEIGHT_LATENCY,
    w_hops: float = WEIGHT_HOPS,
) -> PathMetrics:
    """
    Evaluate explicit quantum routing metrics for a given sequence of nodes.

    Scoring formula:
        Score = w_fid * Fidelity_e2e + w_rel * Reliability - w_lat * norm(Latency) - w_hops * norm(Hops)
    Bounded in range [0.0, 1.0].
    """
    if len(path) < 2:
        return PathMetrics(
            hop_count=0,
            total_distance_km=0.0,
            total_latency_ms=0.0,
            end_to_end_fidelity=1.0,
            overall_reliability=1.0,
            bottleneck_capacity=100,
            avg_error_rate=0.0,
            entanglement_availability=1.0,
            score=1.0,
            formula_explanation="Single node path",
        )

    hop_count = len(path) - 1
    total_distance = 0.0
    total_latency = 0.0
    fidelity_product = 1.0
    reliability_product = 1.0
    capacities = []
    error_rates = []
    availabilities = []

    for i in range(hop_count):
        u, v = path[i], path[i + 1]
        link = topology.get_link(u, v)

        total_distance += link.distance
        total_latency += link.latency
        fidelity_product *= max(0.0, min(1.0, link.fidelity))
        link_reliability = max(0.0, min(1.0, link.success_probability * (1.0 - link.error_rate)))
        reliability_product *= link_reliability
        capacities.append(link.capacity)
        error_rates.append(link.error_rate)
        availabilities.append(1.0 if link.is_available else 0.0)

    bottleneck_capacity = min(capacities) if capacities else 0
    avg_error_rate = sum(error_rates) / len(error_rates) if error_rates else 0.0
    entanglement_avail = min(availabilities) if availabilities else 0.0

    # Normalized latency penalty [0.0, 1.0]
    lat_penalty = min(1.0, total_latency / LATENCY_NORMALIZATION_BASE)
    # Normalized hop penalty [0.0, 1.0]
    hops_penalty = min(1.0, hop_count / HOPS_NORMALIZATION_BASE)

    # Composite score computation
    raw_score = (
        w_fid * fidelity_product
        + w_rel * reliability_product
        - w_lat * lat_penalty
        - w_hops * hops_penalty
    )
    final_score = max(0.0, min(1.0, raw_score))

    formula_desc = (
        f"Score({final_score:.4f}) = {w_fid:.2f}*Fid({fidelity_product:.4f}) + "
        f"{w_rel:.2f}*Rel({reliability_product:.4f}) - "
        f"{w_lat:.2f}*LatPenalty({lat_penalty:.2f}) - "
        f"{w_hops:.2f}*HopsPenalty({hops_penalty:.2f})"
    )

    return PathMetrics(
        hop_count=hop_count,
        total_distance_km=round(total_distance, 3),
        total_latency_ms=round(total_latency, 2),
        end_to_end_fidelity=round(fidelity_product, 6),
        overall_reliability=round(reliability_product, 6),
        bottleneck_capacity=bottleneck_capacity,
        avg_error_rate=round(avg_error_rate, 6),
        entanglement_availability=entanglement_avail,
        score=round(final_score, 6),
        formula_explanation=formula_desc,
    )
