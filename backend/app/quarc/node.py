"""
Quantum Network Node representation.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.quarc.models import NodeStatus, NodeType


@dataclass
class QuantumNode:
    """
    Representation of a physical or logical quantum node.
    Types: CLIENT, ROUTER, REPEATER, ARBITRATOR.
    """
    node_id: str
    name: str = ""
    node_type: NodeType = NodeType.ROUTER
    status: NodeStatus = NodeStatus.ONLINE
    capacity: int = 100  # Qubit buffer/memory capacity
    cluster_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.name:
            self.name = self.node_id

    @property
    def is_available(self) -> bool:
        """Node is available for routing if ONLINE or DEGRADED (with lower preference)."""
        return self.status != NodeStatus.OFFLINE

    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "name": self.name,
            "node_type": self.node_type.value,
            "status": self.status.value,
            "capacity": self.capacity,
            "cluster_id": self.cluster_id,
            "is_available": self.is_available,
            "metadata": self.metadata,
        }
