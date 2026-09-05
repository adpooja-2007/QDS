"""
FastAPI Router for QuARC (Quantum Adaptive Routing using Clusters).

Thin API wrapper delegating directly to QuARCService.
"""

import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status

from app.quarc.exceptions import QuARCError, RerouteFailed, RouteNotFound
from app.quarc.models import RouteConstraint
from app.quarc.service import quarc_service
from app.schemas.quarc import (
    ClusterResponse,
    PathMetricsSchema,
    RerouteRequest,
    RouteRequest,
    RouteResponse,
)

logger = logging.getLogger("qds.api.quarc")

router = APIRouter(prefix="/quarc", tags=["QuARC Quantum Routing"])


@router.post(
    "/route",
    response_model=RouteResponse,
    summary="Select adaptive quantum route",
    description="Select optimal quantum path between source and destination nodes using multi-metric QuARC evaluation.",
)
async def select_route(req: RouteRequest):
    try:
        constraints = None
        if req.constraints:
            constraints = RouteConstraint(
                min_fidelity=req.constraints.min_fidelity,
                max_latency=req.constraints.max_latency,
                min_reliability=req.constraints.min_reliability,
                max_hops=req.constraints.max_hops,
                min_capacity=req.constraints.min_capacity,
                max_error_rate=req.constraints.max_error_rate,
            )

        decision = quarc_service.select_route(
            source=req.source,
            destination=req.destination,
            constraints=constraints,
        )

        metrics_schema = PathMetricsSchema(
            hop_count=decision.metrics.hop_count,
            total_distance_km=decision.metrics.total_distance_km,
            total_latency_ms=decision.metrics.total_latency_ms,
            end_to_end_fidelity=decision.metrics.end_to_end_fidelity,
            overall_reliability=decision.metrics.overall_reliability,
            bottleneck_capacity=decision.metrics.bottleneck_capacity,
            avg_error_rate=decision.metrics.avg_error_rate,
            entanglement_availability=decision.metrics.entanglement_availability,
            score=decision.metrics.score,
            formula_explanation=decision.metrics.formula_explanation,
        )

        return RouteResponse(
            decision_id=decision.decision_id,
            source=decision.source,
            destination=decision.destination,
            selected_path=decision.selected_path,
            score=decision.score,
            hop_count=decision.metrics.hop_count,
            fidelity=decision.metrics.end_to_end_fidelity,
            latency_ms=decision.metrics.total_latency_ms,
            reliability=decision.metrics.overall_reliability,
            metrics=metrics_schema,
            candidate_count=decision.candidate_count,
            reason=decision.reason,
            timestamp=decision.timestamp.isoformat(),
        )
    except RouteNotFound as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except QuARCError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Route selection failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.post(
    "/reroute",
    response_model=RouteResponse,
    summary="Adaptive reroute on failure",
    description="Calculate an alternative route avoiding failed links, offline nodes, or degraded paths.",
)
async def reroute(req: RerouteRequest):
    try:
        constraints = None
        if req.constraints:
            constraints = RouteConstraint(
                min_fidelity=req.constraints.min_fidelity,
                max_latency=req.constraints.max_latency,
                min_reliability=req.constraints.min_reliability,
                max_hops=req.constraints.max_hops,
                min_capacity=req.constraints.min_capacity,
                max_error_rate=req.constraints.max_error_rate,
            )

        failed_link_tuple = None
        if req.failed_link and len(req.failed_link) == 2:
            failed_link_tuple = (req.failed_link[0], req.failed_link[1])

        decision = quarc_service.reroute(
            source=req.source,
            destination=req.destination,
            failed_path=req.failed_path,
            failed_node=req.failed_node,
            failed_link=failed_link_tuple,
            constraints=constraints,
        )

        metrics_schema = PathMetricsSchema(
            hop_count=decision.metrics.hop_count,
            total_distance_km=decision.metrics.total_distance_km,
            total_latency_ms=decision.metrics.total_latency_ms,
            end_to_end_fidelity=decision.metrics.end_to_end_fidelity,
            overall_reliability=decision.metrics.overall_reliability,
            bottleneck_capacity=decision.metrics.bottleneck_capacity,
            avg_error_rate=decision.metrics.avg_error_rate,
            entanglement_availability=decision.metrics.entanglement_availability,
            score=decision.metrics.score,
            formula_explanation=decision.metrics.formula_explanation,
        )

        return RouteResponse(
            decision_id=decision.decision_id,
            source=decision.source,
            destination=decision.destination,
            selected_path=decision.selected_path,
            score=decision.score,
            hop_count=decision.metrics.hop_count,
            fidelity=decision.metrics.end_to_end_fidelity,
            latency_ms=decision.metrics.total_latency_ms,
            reliability=decision.metrics.overall_reliability,
            metrics=metrics_schema,
            candidate_count=decision.candidate_count,
            reason=decision.reason,
            timestamp=decision.timestamp.isoformat(),
        )
    except RerouteFailed as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except QuARCError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Reroute failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get(
    "/clusters",
    response_model=List[ClusterResponse],
    summary="Get topology clusters",
    description="Retrieve clustered network components based on link quality.",
)
async def get_clusters(fidelity_threshold: float = 0.90, max_latency: float = 10.0):
    try:
        clusters = quarc_service.cluster(
            fidelity_threshold=fidelity_threshold,
            max_latency_threshold=max_latency,
        )
        return [
            ClusterResponse(
                cluster_id=c.cluster_id,
                name=c.name,
                member_nodes=c.member_nodes,
                gateway_nodes=c.gateway_nodes,
                avg_fidelity=c.avg_fidelity,
                avg_latency=c.avg_latency,
                total_capacity=c.total_capacity,
            )
            for c in clusters.values()
        ]
    except Exception as exc:
        logger.error("Clustering failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
