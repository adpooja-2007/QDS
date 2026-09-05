"""
QuARC Dynamic Failure Detection and Adaptive Rerouting Engine.

Monitors network state for link/node degradation or disruption and calculates alternative paths.
Guarantees avoidance of failed paths and prevents rerouting loops.
"""

import logging
from typing import List, Optional, Set, Tuple

from app.quarc.exceptions import RerouteFailed, RouteNotFound
from app.quarc.models import (
    LinkStatus,
    NodeStatus,
    RouteConstraint,
    RoutingDecision,
    RoutingEvent,
    RoutingEventType,
)
from app.quarc.selector import AdaptivePathSelector
from app.quarc.topology import QuantumTopology

logger = logging.getLogger("qds.quarc.rerouting")


class ReroutingEngine:
    """
    Adaptive Rerouting manager for handling quantum link and node failures.
    """

    def __init__(self, topology: QuantumTopology, selector: Optional[AdaptivePathSelector] = None):
        self.topology = topology
        self.selector = selector or AdaptivePathSelector(topology)
        self._failed_paths_history: Set[Tuple[str, ...]] = set()
        self._routing_events: List[RoutingEvent] = []

    @property
    def events(self) -> List[RoutingEvent]:
        """Audit trail of routing and rerouting events."""
        return self._routing_events

    def record_event(
        self,
        event_type: RoutingEventType,
        source: str,
        destination: str,
        path: Optional[List[str]] = None,
        reason: str = "",
    ) -> RoutingEvent:
        """Record a routing event for audit and telemetry."""
        event = RoutingEvent(
            event_type=event_type,
            source=source,
            destination=destination,
            path=path,
            reason=reason,
        )
        self._routing_events.append(event)
        logger.info("Routing event: %s (%s -> %s): %s", event_type.value, source, destination, reason)
        return event

    def mark_link_failed(self, source: str, destination: str, reason: str = "Link failure detected"):
        """Mark a link as FAILED in the topology."""
        try:
            link = self.topology.get_link(source, destination)
            link.status = LinkStatus.FAILED
            self.record_event(
                RoutingEventType.ROUTE_FAILED,
                source,
                destination,
                reason=f"Link {source}<->{destination} marked FAILED: {reason}",
            )
        except Exception as exc:
            logger.warning("Could not mark link %s-%s as failed: %s", source, destination, exc)

    def mark_node_offline(self, node_id: str, reason: str = "Node offline detected"):
        """Mark a node as OFFLINE in the topology."""
        try:
            node = self.topology.get_node(node_id)
            node.status = NodeStatus.OFFLINE
            self.record_event(
                RoutingEventType.ROUTE_FAILED,
                node_id,
                node_id,
                reason=f"Node {node_id} marked OFFLINE: {reason}",
            )
        except Exception as exc:
            logger.warning("Could not mark node %s offline: %s", node_id, exc)

    def reroute(
        self,
        source: str,
        destination: str,
        failed_path: Optional[List[str]] = None,
        failed_node: Optional[str] = None,
        failed_link: Optional[Tuple[str, str]] = None,
        constraints: Optional[RouteConstraint] = None,
    ) -> RoutingDecision:
        """
        Execute adaptive rerouting when an active route or network element fails.

        Process:
        1. Mark explicit failed node or link as unavailable.
        2. Blacklist failed path to prevent re-selection.
        3. Query selector for alternative valid route.
        4. Validate that selected route differs from failed path and uses only active elements.
        5. Return new explainable routing decision.
        """
        self.record_event(
            RoutingEventType.REROUTE_STARTED,
            source,
            destination,
            path=failed_path,
            reason="Adaptive reroute initiated due to path/element failure",
        )

        # Step 1: Update failed link / node states if provided
        if failed_link:
            self.mark_link_failed(failed_link[0], failed_link[1], "Reroute trigger")
        if failed_node:
            self.mark_node_offline(failed_node, "Reroute trigger")

        if failed_path:
            self._failed_paths_history.add(tuple(failed_path))

        # Step 2: Attempt path selection with remaining active network elements
        try:
            decision = self.selector.select_path(
                source=source,
                destination=destination,
                constraints=constraints,
            )

            # Check if newly selected path was previously marked failed
            if tuple(decision.selected_path) in self._failed_paths_history:
                # Need to find alternative candidate that is not in failed paths
                alternative = None
                for candidate in decision.candidates:
                    if candidate.is_valid and tuple(candidate.path_nodes) not in self._failed_paths_history:
                        alternative = candidate
                        break

                if not alternative:
                    raise RerouteFailed(source, destination, failed_path or [])

                decision.selected_path = alternative.path_nodes
                decision.score = alternative.metrics.score
                decision.metrics = alternative.metrics
                decision.reason = (
                    f"Rerouted to backup path {alternative.path_nodes} "
                    f"(Score={alternative.metrics.score:.4f}, Fidelity={alternative.metrics.end_to_end_fidelity:.4f}) "
                    f"after avoiding failed path {failed_path}."
                )

            self.record_event(
                RoutingEventType.REROUTE_COMPLETED,
                source,
                destination,
                path=decision.selected_path,
                reason=f"Successfully rerouted to {decision.selected_path}",
            )
            return decision

        except (RouteNotFound, Exception) as exc:
            self.record_event(
                RoutingEventType.REROUTE_FAILED,
                source,
                destination,
                path=failed_path,
                reason=str(exc),
            )
            raise RerouteFailed(source, destination, failed_path or []) from exc
