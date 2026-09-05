"""
Domain models and enums for QuARC (Quantum Adaptive Routing using Clusters).
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class NodeType(str, Enum):
    """Types of quantum network nodes."""
    CLIENT = "CLIENT"
    ROUTER = "ROUTER"
    REPEATER = "REPEATER"
    ARBITRATOR = "ARBITRATOR"


class NodeStatus(str, Enum):
    """Operating status of a quantum node."""
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    DEGRADED = "DEGRADED"


class LinkStatus(str, Enum):
    """Operating status of a quantum link."""
    ACTIVE = "ACTIVE"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"


class RoutingEventType(str, Enum):
    """Lifecycle events during quantum adaptive routing."""
    ROUTE_SELECTED = "ROUTE_SELECTED"
    ROUTE_DEGRADED = "ROUTE_DEGRADED"
    ROUTE_FAILED = "ROUTE_FAILED"
    REROUTE_STARTED = "REROUTE_STARTED"
    REROUTE_COMPLETED = "REROUTE_COMPLETED"
    REROUTE_FAILED = "REROUTE_FAILED"


@dataclass
class RouteConstraint:
    """Constraints for adaptive path selection."""
    min_fidelity: float = 0.70
    max_latency: float = 100.0  # ms
    min_reliability: float = 0.50
    max_hops: int = 10
    min_capacity: int = 1
    max_error_rate: float = 0.15


@dataclass
class PathMetrics:
    """Detailed evaluation metrics for a quantum path."""
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


@dataclass
class CandidatePath:
    """A candidate route path with its evaluated metrics."""
    path_nodes: List[str]
    metrics: PathMetrics
    is_valid: bool = True
    rejection_reason: Optional[str] = None


@dataclass
class RoutingDecision:
    """Explainable result of adaptive route selection."""
    decision_id: str
    source: str
    destination: str
    selected_path: List[str]
    score: float
    metrics: PathMetrics
    candidate_count: int
    candidates: List[CandidatePath]
    reason: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "decision_id": self.decision_id,
            "source": self.source,
            "destination": self.destination,
            "selected_path": self.selected_path,
            "score": round(self.score, 4),
            "hop_count": self.metrics.hop_count,
            "fidelity": round(self.metrics.end_to_end_fidelity, 4),
            "latency_ms": round(self.metrics.total_latency_ms, 2),
            "reliability": round(self.metrics.overall_reliability, 4),
            "reason": self.reason,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class RoutingEvent:
    """Record of routing lifecycle events and telemetry."""
    event_type: RoutingEventType
    source: str
    destination: str
    path: Optional[List[str]] = None
    reason: str = ""
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
