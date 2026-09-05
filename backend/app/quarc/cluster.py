"""
QuARC Clustering Manager.

Partitions the quantum network into clusters based on quantum-physical constraints:
- Link transmission fidelity
- Channel latency
- Node capacity and connectivity

Engineering Note: This is an engineering adaptation of the QuARC clustering concept,
enabling hierarchical domain partitioning without coupling to specific path selection heuristics.
"""

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set

from app.quarc.models import LinkStatus, NodeStatus
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.cluster")


@dataclass
class NetworkCluster:
    """A cluster of tightly coupled quantum nodes."""
    cluster_id: str
    name: str
    member_nodes: List[str] = field(default_factory=list)
    gateway_nodes: List[str] = field(default_factory=list)
    avg_fidelity: float = 1.0
    avg_latency: float = 0.0
    total_capacity: int = 0


class ClusterManager:
    """
    Manages topological clustering for the quantum network.
    """

    def __init__(self, topology: QuantumTopology):
        self.topology = topology
        self._clusters: Dict[str, NetworkCluster] = {}
        self._node_to_cluster: Dict[str, str] = {}

    @property
    def clusters(self) -> Dict[str, NetworkCluster]:
        """All defined clusters."""
        return self._clusters

    def cluster_network(
        self,
        fidelity_threshold: float = 0.90,
        max_latency_threshold: float = 10.0,
    ) -> Dict[str, NetworkCluster]:
        """
        Partition available topology into clusters based on quantum link quality.
        Nodes connected by high-fidelity (>= fidelity_threshold) and low-latency (<= max_latency_threshold)
        links are merged into common clusters.
        """
        self._clusters.clear()
        self._node_to_cluster.clear()

        visited_nodes: Set[str] = set()
        cluster_idx = 1

        for node_id, node in self.topology.nodes.items():
            if not node.is_available or node_id in visited_nodes:
                continue

            # BFS to discover cluster connected component
            cluster_members: List[str] = []
            queue = [node_id]
            visited_nodes.add(node_id)

            while queue:
                curr = queue.pop(0)
                cluster_members.append(curr)

                for nbr in self.topology.neighbors(curr, available_only=True):
                    if nbr not in visited_nodes:
                        try:
                            link = self.topology.get_link(curr, nbr)
                            # Only include in same cluster if channel quality meets threshold
                            if (
                                link.fidelity >= fidelity_threshold
                                and link.latency <= max_latency_threshold
                                and link.status == LinkStatus.ACTIVE
                            ):
                                visited_nodes.add(nbr)
                                queue.append(nbr)
                        except Exception:
                            continue

            cluster_id = f"CLUSTER-{cluster_idx}"
            cluster_idx += 1

            # Compute cluster aggregate statistics
            total_cap = sum(self.topology.get_node(n).capacity for n in cluster_members)
            fidelities = []
            latencies = []
            gateways = set()

            for n in cluster_members:
                self._node_to_cluster[n] = cluster_id
                self.topology.get_node(n).cluster_id = cluster_id
                # Check for links to external nodes (gateways)
                for nbr in self.topology.neighbors(n, available_only=True):
                    if nbr not in cluster_members:
                        gateways.add(n)
                    try:
                        l = self.topology.get_link(n, nbr)
                        fidelities.append(l.fidelity)
                        latencies.append(l.latency)
                    except Exception:
                        pass

            avg_fid = sum(fidelities) / len(fidelities) if fidelities else 1.0
            avg_lat = sum(latencies) / len(latencies) if latencies else 0.0

            cluster = NetworkCluster(
                cluster_id=cluster_id,
                name=f"Quantum Cluster {cluster_id}",
                member_nodes=cluster_members,
                gateway_nodes=list(gateways),
                avg_fidelity=round(avg_fid, 4),
                avg_latency=round(avg_lat, 2),
                total_capacity=total_cap,
            )

            self._clusters[cluster_id] = cluster

        logger.info("Topology clustered into %d clusters", len(self._clusters))
        return self._clusters

    def get_cluster(self, node_id: str) -> Optional[NetworkCluster]:
        """Get the cluster that contains the specified node."""
        cid = self._node_to_cluster.get(node_id)
        if cid:
            return self._clusters.get(cid)
        return None

    def get_cluster_members(self, cluster_id: str) -> List[str]:
        """List member node IDs for a cluster."""
        cluster = self._clusters.get(cluster_id)
        return cluster.member_nodes if cluster else []

    def get_neighboring_clusters(self, cluster_id: str) -> List[str]:
        """Find adjacent clusters connected via gateway links."""
        cluster = self._clusters.get(cluster_id)
        if not cluster:
            return []

        neighbor_clusters: Set[str] = set()
        for node in cluster.member_nodes:
            for nbr in self.topology.neighbors(node, available_only=True):
                nbr_cid = self._node_to_cluster.get(nbr)
                if nbr_cid and nbr_cid != cluster_id:
                    neighbor_clusters.add(nbr_cid)

        return list(neighbor_clusters)
