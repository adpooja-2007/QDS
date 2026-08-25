"""
Input Pydantic models for Module 2 Threat Engine.
"""

from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import AttackType


class QuantumMeasurementData(BaseModel):
    """Alice or Bob quantum measurement data."""
    model_config = ConfigDict(extra="forbid")

    bits: list[int] = Field(..., description="Array of measured or prepared bits (0 or 1)")
    bases: list[Literal["Z", "X"]] = Field(..., description="Array of bases used ('Z' or 'X')")


class ChannelParameters(BaseModel):
    """Physical channel assumptions and metadata."""
    model_config = ConfigDict(extra="forbid")

    baseline_qber: float = Field(default=0.02, ge=0.0, le=1.0, description="Expected baseline physical channel QBER")
    attack_fraction: float = Field(default=0.0, ge=0.0, le=1.0, description="Estimated attack fraction or injected noise level")


class SecurityParameters(BaseModel):
    """Statistical error tolerance and threshold parameters."""
    model_config = ConfigDict(extra="forbid")

    false_alarm_rate: float = Field(default=1e-9, gt=0.0, lt=1.0, description="Tail probability alpha for Hoeffding bound")
    minimum_sifted_bits: int = Field(default=10, ge=1, description="Minimum number of sifted bits required for security testing")


class CHSHData(BaseModel):
    """Entanglement verification parameters."""
    model_config = ConfigDict(extra="forbid")

    enabled: bool = Field(default=True, description="Whether CHSH verification is evaluated")
    correlation_score: float | None = Field(default=None, description="Observed CHSH score S (e.g. 2.72)")


class SingleStateCount(BaseModel):
    """Counts for decoy or signal intensity states."""
    model_config = ConfigDict(extra="forbid")

    sent: int = Field(..., ge=0)
    detected: int = Field(..., ge=0)
    errors: int = Field(..., ge=0)


class DecoyStateData(BaseModel):
    """Decoy-state security metadata."""
    model_config = ConfigDict(extra="forbid")

    enabled: bool = Field(default=False, description="Whether decoy state statistics are evaluated")
    signal: SingleStateCount | None = Field(default=None, description="Signal state statistics")
    decoy: SingleStateCount | None = Field(default=None, description="Decoy state statistics")


class SecurityAnalysisRequest(BaseModel):
    """Canonical request contract for Module 2 threat analysis."""
    model_config = ConfigDict(extra="forbid")

    session_id: str = Field(..., description="Unique identifier for the session")
    block_id: str = Field(default="BLOCK-001", description="Identifier for the specific key block")
    alice: QuantumMeasurementData = Field(..., description="Alice's state preparation data")
    bob: QuantumMeasurementData = Field(..., description="Bob's measurement data")
    channel: ChannelParameters = Field(default_factory=ChannelParameters, description="Channel noise model")
    security_parameters: SecurityParameters = Field(default_factory=SecurityParameters, description="Statistical parameters")
    chsh: CHSHData = Field(default_factory=CHSHData, description="CHSH entanglement data")
    decoy: DecoyStateData | None = Field(default=None, description="Decoy state statistics")
    attack_type: AttackType = Field(default=AttackType.NONE, description="Simulator-indicated attack metadata if known")


# Specific request models for individual granular endpoints

class SiftingRequest(BaseModel):
    alice_bases: list[Literal["Z", "X"]]
    bob_bases: list[Literal["Z", "X"]]


class XORRequest(BaseModel):
    alice_bits: list[int]
    bob_bits: list[int]


class QBERRequest(BaseModel):
    alice_bits: list[int]
    bob_bits: list[int]


class ThresholdRequest(BaseModel):
    baseline_qber: float = Field(default=0.02, ge=0.0, le=1.0)
    sample_count: int = Field(..., ge=1)
    false_alarm_rate: float = Field(default=1e-9, gt=0.0, lt=1.0)


class CHSHRequest(BaseModel):
    score: float


class DecoyAnalysisRequest(BaseModel):
    signal: SingleStateCount
    decoy: SingleStateCount


class MockScenarioRequest(BaseModel):
    scenario: AttackType = Field(default=AttackType.NONE, description="Scenario type: none, noise, mitm, forgery, replay, pns")
    key_length: int = Field(default=1000, ge=10, le=100000)
    baseline_qber: float = Field(default=0.02, ge=0.0, le=1.0)
    attack_fraction: float = Field(default=0.0, ge=0.0, le=1.0)
    seed: int | None = Field(default=42, description="Random seed for reproducibility")
