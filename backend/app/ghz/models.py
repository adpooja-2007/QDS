"""
Domain models and enums for the GHZ Quantum Entanglement module.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class BasisType(str, Enum):
    """Allowed single-qubit measurement bases."""
    Z = "Z"
    X = "X"


class GHZStateStatus(str, Enum):
    """Lifecycle states of a GHZ entanglement instance."""
    INITIALIZED = "INITIALIZED"
    DISTRIBUTED = "DISTRIBUTED"
    MEASURED = "MEASURED"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"


class GHZVerificationDecision(str, Enum):
    """Verification verdict for GHZ measurement parity/correlation."""
    PASS = "PASS"
    FAIL = "FAIL"


@dataclass
class QubitMapping:
    """Mapping from physical/logical qubit index to network participant."""
    qubit_index: int
    participant_id: str
    basis: Optional[str] = None


@dataclass
class GHZMeasurementResult:
    """Raw and processed measurement outcomes from simulated quantum execution."""
    ghz_id: str
    basis: List[str]
    shots: int
    raw_counts: Dict[str, int]
    measured_samples: List[str]
    participant_mapping: Dict[int, str]
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class GHZVerificationResult:
    """Mathematical verification metrics derived from genuine quantum measurement counts."""
    ghz_id: str
    basis: List[str]
    total_measurements: int
    valid_measurements: int
    error_count: int
    error_rate: float
    qber: float
    parity_passed: bool
    verified: bool
    decision: GHZVerificationDecision
    threshold: float
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
