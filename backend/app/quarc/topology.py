"""
Quantum Network Topology Graph Abstraction.

Manages nodes and undirected/directed quantum links, adjacency lists, and candidate path discovery.
"""

import logging
from typing import Dict, List, Optional, Set, Tuple

from app.quarc.exceptions import InvalidTopology, LinkNotFound, NodeNotFound
from app.quarc.link import QuantumLink
from app.quarc.models import LinkStatus, NodeStatus
from app.quarc.node import QuantumNode

logger = logging.getLogger("qds.quarc.topology")


class QuantumTopology:
    """
    Graph representation of a Quantum Network.
    Maintains nodes and bidirectional link lookups.
    """

    def __init__(self):
        self._nodes: Dict[str, QuantumNode] = {}
        # Adjacency map: node_id -> {neighbor_id: link_id}
        self._adjacency: Dict[str, Dict[str, str]] = {}
        # Link map: link_id -> QuantumLink
        self._links: Dict[str, QuantumLink] = {}
        # Fast pair lookup: (src, dst) -> link_id
        self._pair_to_link: Dict[Tuple[str, str], str] = {}

    @property
    def nodes(self) -> Dict[str, QuantumNode]:
        """All registered quantum nodes."""
        return self._nodes

    @property
    def links(self) -> Dict[str, QuantumLink]:
        """All registered quantum links."""
        return self._links

    def add_node(self, node: QuantumNode) -> QuantumNode:
        """Register a new node into the topology."""
        if not node.node_id:
            raise InvalidTopology("Node ID cannot be empty.")
        self._nodes[node.node_id] = node
        if node.node_id not in self._adjacency:
            self._adjacency[node.node_id] = {}
        logger.debug("Added node %s (%s)", node.node_id, node.node_type.value)
        return node

    def remove_node(self, node_id: str) -> Optional[QuantumNode]:
        """Remove a node and all connected links from the topology."""
        if node_id not in self._nodes:
            return None
        node = self._nodes.pop(node_id)
        # Remove connected links
        neighbors = list(self._adjacency.get(node_id, {}).keys())
        for nbr in neighbors:
            self.remove_link(node_id, nbr)
        self._adjacency.pop(node_id, None)
        return node

    def get_node(self, node_id: str) -> QuantumNode:
        """Retrieve node by ID or raise NodeNotFound."""
        if node_id not in self._nodes:
            raise NodeNotFound(node_id)
        return self._nodes[node_id]

    def add_link(self, link: QuantumLink, bidirectional: bool = True) -> QuantumLink:
        """
        Add a quantum communication link between two existing nodes.
        If bidirectional is True (default for optical fibers/channels), registers both directions.
        """
        if link.source not in self._nodes:
            raise NodeNotFound(link.source)
        if link.destination not in self._nodes:
            raise NodeNotFound(link.destination)
        if link.source == link.destination:
            raise InvalidTopology("Self-loop links are not allowed.")

        self._links[link.link_id] = link
        self._adjacency[link.source][link.destination] = link.link_id
        self._pair_to_link[(link.source, link.destination)] = link.link_id

        if bidirectional:
            self._adjacency[link.destination][link.source] = link.link_id
            self._pair_to_link[(link.destination, link.source)] = link.link_id

        logger.debug("Added link %s between %s and %s", link.link_id, link.source, link.destination)
        return link

    def remove_link(self, source: str, destination: str) -> bool:
        """Remove link between two nodes."""
        link_id = self._pair_to_link.pop((source, destination), None)
        self._pair_to_link.pop((destination, source), None)

        if source in self._adjacency:
            self._adjacency[source].pop(destination, None)
        if destination in self._adjacency:
            self._adjacency[destination].pop(source, None)

        if link_id and link_id in self._links:
            self._links.pop(link_id, None)
            return True
        return False

    def get_link(self, source: str, destination: str) -> QuantumLink:
        """Retrieve link between source and destination or raise LinkNotFound."""
        pair_key = (source, destination)
        if pair_key not in self._pair_to_link:
            raise LinkNotFound(source, destination)
        link_id = self._pair_to_link[pair_key]
        return self._links[link_id]

    def has_link(self, source: str, destination: str) -> bool:
        """Check if a direct link exists between two nodes."""
        return (source, destination) in self._pair_to_link

    def neighbors(self, node_id: str, available_only: bool = True) -> List[str]:
        """
        List neighbor nodes for a given node.
        If available_only is True, filters out offline nodes and failed links.
        """
        if node_id not in self._nodes:
            raise NodeNotFound(node_id)

        nbr_dict = self._adjacency.get(node_id, {})
        result = []
        for nbr_id, link_id in nbr_dict.items():
            if available_only:
                nbr_node = self._nodes.get(nbr_id)
                link = self._links.get(link_id)
                if not nbr_node or not nbr_node.is_available:
                    continue
                if not link or not link.is_available:
                    continue
            result.append(nbr_id)
        return result

    def find_paths(
        self,
        source: str,
        destination: str,
        max_hops: int = 10,
        available_only: bool = True,
        cutoff_limit: int = 50,
    ) -> List[List[str]]:
        """
        Find all simple (loop-free) candidate paths between source and destination up to max_hops.
        Uses depth-first path exploration.
        """
        if source not in self._nodes:
            raise NodeNotFound(source)
        if destination not in self._nodes:
            raise NodeNotFound(destination)

        if source == destination:
            return [[source]]

        paths: List[List[str]] = []
        visited: Set[str] = {source}

        def dfs(current: str, target: str, current_path: List[str]):
            if len(paths) >= cutoff_limit:
                return
            if len(current_path) - 1 >= max_hops:
                return
            if current == target:
                paths.append(list(current_path))
                return

            for nbr in self.neighbors(current, available_only=available_only):
                if nbr not in visited:
                    visited.add(nbr)
                    current_path.append(nbr)
                    dfs(nbr, target, current_path)
                    current_path.pop()
                    visited.remove(nbr)

        dfs(source, destination, [source])
        return paths

    def to_dict(self) -> Dict:
        return {
            "node_count": len(self._nodes),
            "link_count": len(self._links),
            "nodes": [n.to_dict() for n in self._nodes.values()],
            "links": [l.to_dict() for l in self._links.values()],
        }
