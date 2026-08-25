"""
Application Configuration and Default Security Parameters.
"""

from pydantic import BaseModel, Field


class ThreatEngineSettings(BaseModel):
    """Global configuration settings for the Threat Engine."""

    APP_NAME: str = "Deterministic Statistical Threat Detection Engine"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1/security"

    # Default Mathematical & Physical Constants
    DEFAULT_BASELINE_QBER: float = Field(default=0.02, ge=0.0, le=1.0)
    DEFAULT_FALSE_ALARM_RATE: float = Field(default=1e-9, gt=0.0, lt=1.0)
    MINIMUM_SIFTED_BITS: int = Field(default=1, ge=1)

    # CHSH Entanglement Security Parameters
    CHSH_CLASSICAL_LIMIT: float = 2.0
    CHSH_QUANTUM_IDEAL: float = 2.8284271247461903  # 2 * sqrt(2)
    CHSH_STRONG_THRESHOLD: float = 2.4

    # Decoy State Anomaly Discrepancy Threshold
    DECOY_ERROR_DISCREPANCY_THRESHOLD: float = 0.05


settings = ThreatEngineSettings()
