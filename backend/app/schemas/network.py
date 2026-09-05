"""
Pydantic schemas for Quantum Network Topology modeling.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NodeCreateRequest(BaseModel):
    """Request to create or register a quantum node."""
    node_id: str = Field(..., description="Unique node identifier", examples=["node1"])
    name: Optional[str] = Field(default="", description="Display name for the node")
    node_type: str = Field(default="ROUTER", description="CLIENT, ROUTER, REPEATER, ARBITRATOR")
    status: str = Field(default="ONLINE", description="ONLINE, OFFLINE, DEGRADED")
    capacity: int = Field(default=100, ge=1, description="Qubit memory buffer capacity")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NodeResponse(BaseModel):
    """Response representing a quantum node."""
    node_id: str
    name: str
    node_type: str
    status: str
    capacity: int
    cluster_id: Optional[str] = None
    is_available: bool
    metadata: Dict[str, Any]


class LinkCreateRequest(BaseModel):
    """Request to create or register a quantum link."""
    link_id: str = Field(..., description="Unique link identifier", examples=["link_alice_node1"])
    source: str = Field(..., description="Source node ID")
    destination: str = Field(..., description="Destination node ID")
    distance: float = Field(default=1.0, ge=0.0, description="Physical distance in km")
    fidelity: float = Field(default=0.98, ge=0.0, le=1.0, description="Bell state transmission fidelity")
    latency: float = Field(default=1.0, ge=0.0, description="Transmission latency in ms")
    capacity: int = Field(default=50, ge=1, description="Simultaneous channel capacity")
    success_probability: float = Field(default=0.95, ge=0.0, le=1.0, description="Entanglement generation probability")
    error_rate: float = Field(default=0.02, ge=0.0, le=1.0, description="Channel bit error rate")
    status: str = Field(default="ACTIVE", description="ACTIVE, DEGRADED, FAILED")
    bidirectional: bool = Field(default=True, description="Whether the channel operates bidirectionally")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LinkResponse(BaseModel):
    """Response representing a quantum link."""
    link_id: str
    source: str
    destination: str
    distance_km: float
    fidelity: float
    latency_ms: float
    capacity: int
    success_probability: float
    error_rate: float
    status: str
    is_available: bool
    metadata: Dict[str, Any]


class TopologyResponse(BaseModel):
    """Response representing complete network topology."""
    node_count: int
    link_count: int
    nodes: List[NodeResponse]
    links: List[LinkResponse]
