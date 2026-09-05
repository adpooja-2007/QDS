"""
Pydantic schemas for the QuARC (Quantum Adaptive Routing using Clusters) module.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RouteConstraintSchema(BaseModel):
    """Routing constraints schema."""
    min_fidelity: float = Field(default=0.70, ge=0.0, le=1.0)
    max_latency: float = Field(default=100.0, ge=0.0)
    min_reliability: float = Field(default=0.50, ge=0.0, le=1.0)
    max_hops: int = Field(default=10, ge=1, le=50)
    min_capacity: int = Field(default=1, ge=1)
    max_error_rate: float = Field(default=0.15, ge=0.0, le=1.0)


class RouteRequest(BaseModel):
    """Request to select an adaptive quantum path."""
    source: str = Field(..., description="Source node ID", examples=["alice"])
    destination: str = Field(..., description="Destination node ID", examples=["bob"])
    constraints: Optional[RouteConstraintSchema] = Field(default=None)
    max_hops: int = Field(default=10, ge=1, le=50)


class RerouteRequest(BaseModel):
    """Request to perform adaptive rerouting away from a failed path or element."""
    source: str = Field(..., description="Source node ID")
    destination: str = Field(..., description="Destination node ID")
    failed_path: Optional[List[str]] = Field(default=None, description="Previously failed node sequence")
    failed_node: Optional[str] = Field(default=None, description="Specific node marked offline")
    failed_link: Optional[List[str]] = Field(default=None, description="Specific link [src, dst] marked failed")
    constraints: Optional[RouteConstraintSchema] = Field(default=None)


class PathMetricsSchema(BaseModel):
    """Metrics evaluation of a candidate quantum path."""
    hop_count: int
    total_distance_km: float
    total_latency_ms: float
    end_to_end_fidelity: float
    overall_reliability: float
    bottleneck_capacity: int
    avg_error_rate: float
    entanglement_availability: float
    score: float
    formula_explanation: str


class CandidatePathSchema(BaseModel):
    """Candidate route path details."""
    path_nodes: List[str]
    metrics: PathMetricsSchema
    is_valid: bool
    rejection_reason: Optional[str] = None


class RouteResponse(BaseModel):
    """Response containing selected path and full evaluation details."""
    decision_id: str
    source: str
    destination: str
    selected_path: List[str]
    score: float
    hop_count: int
    fidelity: float
    latency_ms: float
    reliability: float
    metrics: PathMetricsSchema
    candidate_count: int
    reason: str
    timestamp: str


class ClusterResponse(BaseModel):
    """Summary of a network cluster."""
    cluster_id: str
    name: str
    member_nodes: List[str]
    gateway_nodes: List[str]
    avg_fidelity: float
    avg_latency: float
    total_capacity: int
