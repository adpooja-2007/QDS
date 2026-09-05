"""
GHZ State Representation and lifecycle tracker.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.ghz.models import GHZMeasurementResult, GHZStateStatus, GHZVerificationResult, QubitMapping


@dataclass
class GHZState:
    """
    Structured representation of a 3-qubit GHZ entanglement instance.

    Tracks participant mappings, quantum circuit status, and measurement outcomes.
    Simulated backend representation — does not claim physical qubit transmission.
    """
    ghz_id: str = field(default_factory=lambda: f"GHZ-{uuid.uuid4().hex[:12].upper()}")
    qubit_count: int = 3
    participants: List[str] = field(default_factory=list)
    qubit_mapping: Dict[int, str] = field(default_factory=dict)
    shots: int = 1000
    noise_rate: float = 0.0
    status: GHZStateStatus = GHZStateStatus.INITIALIZED
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    measurement_result: Optional[GHZMeasurementResult] = None
    verification_result: Optional[GHZVerificationResult] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        return {
            "ghz_id": self.ghz_id,
            "qubit_count": self.qubit_count,
            "participants": self.participants,
            "qubit_mapping": self.qubit_mapping,
            "shots": self.shots,
            "noise_rate": self.noise_rate,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "has_measurement": self.measurement_result is not None,
            "has_verification": self.verification_result is not None,
            "metadata": self.metadata,
        }
