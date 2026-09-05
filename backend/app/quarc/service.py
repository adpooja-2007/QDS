"""
QuARC Service - Public interface for Quantum Adaptive Routing operations.

Provides a standalone, decoupled facade for building quantum network topologies,
clustering, candidate route discovery, adaptive path selection, and failure rerouting.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

from app.quarc.cluster import ClusterManager, NetworkCluster
from app.quarc.link import QuantumLink
from app.quarc.models import (
    CandidatePath,
    LinkStatus,
    NodeStatus,
    NodeType,
    RouteConstraint,
    RoutingDecision,
    RoutingEvent,
)
from app.quarc.node import QuantumNode
from app.quarc.path import find_candidate_paths
from app.quarc.rerouting import ReroutingEngine
from app.quarc.selector import AdaptivePathSelector
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.service")


class QuARCService:
    """
    Public domain service for Quantum Adaptive Routing using Clusters (QuARC).
    Maintains standalone graph topology and routing engines in-memory.
    """

    def __init__(self, topology: Optional[QuantumTopology] = None):
        self.topology = topology or QuantumTopology()
        self.cluster_manager = ClusterManager(self.topology)
        self.selector = AdaptivePathSelector(self.topology)
        self.rerouter = ReroutingEngine(self.topology, self.selector)

    def add_node(
        self,
        node_id: str,
        name: str = "",
        node_type: NodeType = NodeType.ROUTER,
        status: NodeStatus = NodeStatus.ONLINE,
        capacity: int = 100,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> QuantumNode:
        """Add a node to the quantum network topology."""
        node = QuantumNode(
            node_id=node_id,
            name=name or node_id,
            node_type=node_type,
            status=status,
            capacity=capacity,
            metadata=metadata or {},
        )
        return self.topology.add_node(node)

    def add_link(
        self,
        link_id: str,
        source: str,
        destination: str,
        distance: float = 1.0,
        fidelity: float = 0.98,
        latency: float = 1.0,
        capacity: int = 50,
        success_probability: float = 0.95,
        error_rate: float = 0.02,
        status: LinkStatus = LinkStatus.ACTIVE,
        bidirectional: bool = True,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> QuantumLink:
        """Add a quantum communication link between two nodes."""
        link = QuantumLink(
            link_id=link_id,
            source=source,
            destination=destination,
            distance=distance,
            fidelity=fidelity,
            latency=latency,
            capacity=capacity,
            success_probability=success_probability,
            error_rate=error_rate,
            status=status,
            metadata=metadata or {},
        )
        return self.topology.add_link(link, bidirectional=bidirectional)

    def get_node(self, node_id: str) -> QuantumNode:
        """Retrieve node by ID."""
        return self.topology.get_node(node_id)

    def get_link(self, source: str, destination: str) -> QuantumLink:
        """Retrieve link between two nodes."""
        return self.topology.get_link(source, destination)

    def remove_node(self, node_id: str) -> Optional[QuantumNode]:
        """Remove a node from the topology."""
        return self.topology.remove_node(node_id)

    def remove_link(self, source: str, destination: str) -> bool:
        """Remove a link between two nodes."""
        return self.topology.remove_link(source, destination)

    def cluster(
        self,
        fidelity_threshold: float = 0.90,
        max_latency_threshold: float = 10.0,
    ) -> Dict[str, NetworkCluster]:
        """Cluster the quantum network according to physical quality thresholds."""
        return self.cluster_manager.cluster_network(
            fidelity_threshold=fidelity_threshold,
            max_latency_threshold=max_latency_threshold,
        )

    def find_routes(
        self,
        source: str,
        destination: str,
        constraints: Optional[RouteConstraint] = None,
        max_candidates: int = 10,
    ) -> List[CandidatePath]:
        """Discover and rank candidate quantum paths between source and destination."""
        return find_candidate_paths(
            topology=self.topology,
            source=source,
            destination=destination,
            constraints=constraints,
            max_candidates=max_candidates,
            available_only=True,
        )

    def select_route(
        self,
        source: str,
        destination: str,
        constraints: Optional[RouteConstraint] = None,
    ) -> RoutingDecision:
        """Select the optimal quantum route matching constraints."""
        return self.selector.select_path(
            source=source,
            destination=destination,
            constraints=constraints,
        )

    def reroute(
        self,
        source: str,
        destination: str,
        failed_path: Optional[List[str]] = None,
        failed_node: Optional[str] = None,
        failed_link: Optional[Tuple[str, str]] = None,
        constraints: Optional[RouteConstraint] = None,
    ) -> RoutingDecision:
        """Perform adaptive rerouting when an active route or network element fails."""
        return self.rerouter.reroute(
            source=source,
            destination=destination,
            failed_path=failed_path,
            failed_node=failed_node,
            failed_link=failed_link,
            constraints=constraints,
        )

    def get_topology(self) -> Dict:
        """Export serialized network topology."""
        return self.topology.to_dict()

    def get_events(self) -> List[RoutingEvent]:
        """Get all recorded routing events."""
        return self.rerouter.events


# Global singleton service instance
quarc_service = QuARCService()
