"""
Pydantic schemas for the GHZ Quantum Entanglement module.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GHZCreateRequest(BaseModel):
    """Request to create a new 3-qubit GHZ entanglement state."""
    participants: Optional[List[str]] = Field(
        default=None,
        description="Optional list of exactly 3 distinct participant identities (e.g. ['alice', 'bob', 'charlie']).",
        examples=[["alice", "bob", "charlie"]],
    )
    shots: int = Field(default=1000, ge=1, le=100000, description="Number of measurement repetitions.")
    noise_rate: float = Field(default=0.0, ge=0.0, le=1.0, description="Simulated channel noise rate.")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary metadata.")


class GHZDistributeRequest(BaseModel):
    """Request to distribute an existing GHZ state to 3 participants."""
    ghz_id: str = Field(..., description="Target GHZ state identifier.")
    participants: List[str] = Field(
        ...,
        description="List of exactly 3 distinct participant identities.",
        examples=[["alice", "bob", "charlie"]],
    )


class GHZMeasureRequest(BaseModel):
    """Request to perform projective quantum measurement on GHZ state."""
    ghz_id: str = Field(..., description="Target GHZ state identifier.")
    basis: List[str] = Field(
        default=["Z", "Z", "Z"],
        description="Measurement basis for each of the 3 qubits. Options: 'Z' or 'X'.",
        examples=[["Z", "Z", "Z"], ["X", "X", "X"]],
    )
    shots: Optional[int] = Field(default=None, ge=1, le=100000)
    noise_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    seed: Optional[int] = Field(default=None, description="Optional RNG seed for deterministic simulation.")


class GHZVerifyRequest(BaseModel):
    """Request to verify GHZ measurement parity and calculate QBER."""
    ghz_id: str = Field(..., description="Target GHZ state identifier.")
    threshold: float = Field(default=0.05, ge=0.0, le=1.0, description="Maximum allowable error rate (QBER).")


class GHZStateResponse(BaseModel):
    """Response representing a GHZ state instance."""
    ghz_id: str
    qubit_count: int
    participants: List[str]
    qubit_mapping: Dict[int, str]
    shots: int
    noise_rate: float
    status: str
    created_at: str
    has_measurement: bool
    has_verification: bool
    metadata: Dict[str, Any]


class GHZMeasurementResponse(BaseModel):
    """Response representing raw and processed GHZ measurement outcomes."""
    ghz_id: str
    basis: List[str]
    shots: int
    raw_counts: Dict[str, int]
    participant_mapping: Dict[int, str]
    unique_outcomes: int


class GHZVerificationResponse(BaseModel):
    """Response representing GHZ statistical verification results."""
    ghz_id: str
    basis: List[str]
    total_measurements: int
    valid_measurements: int
    error_count: int
    error_rate: float
    qber: float
    parity_passed: bool
    verified: bool
    decision: str
    threshold: float
    details: Dict[str, Any]
