"""
Quantum Network Link representation.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.quarc.models import LinkStatus


@dataclass
class QuantumLink:
    """
    Representation of an optical or free-space quantum channel between two adjacent nodes.
    Exposes channel metrics (fidelity, latency, error rate, capacity).
    Does NOT contain route selection logic.
    """
    link_id: str
    source: str
    destination: str
    distance: float = 1.0  # km
    fidelity: float = 0.98  # Bell state transmission fidelity (0.0 to 1.0)
    latency: float = 1.0  # ms
    capacity: int = 50  # EPR pairs/second or simultaneous channels
    success_probability: float = 0.95  # Entanglement generation success probability
    error_rate: float = 0.02  # Quantum channel bit error rate
    status: LinkStatus = LinkStatus.ACTIVE
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def is_available(self) -> bool:
        """Link is usable if not FAILED and error rate is below cutoff."""
        return self.status != LinkStatus.FAILED and self.fidelity > 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "link_id": self.link_id,
            "source": self.source,
            "destination": self.destination,
            "distance_km": self.distance,
            "fidelity": self.fidelity,
            "latency_ms": self.latency,
            "capacity": self.capacity,
            "success_probability": self.success_probability,
            "error_rate": self.error_rate,
            "status": self.status.value,
            "is_available": self.is_available,
            "metadata": self.metadata,
        }
