"""
Exceptions for the GHZ Quantum Entanglement module.
"""


class GHZError(Exception):
    """Base exception for all GHZ-related errors."""
    pass


class InvalidGHZParticipants(GHZError):
    """Raised when participant list is invalid (not exactly 3, duplicates, or empty)."""
    def __init__(self, message: str = "GHZ state requires exactly 3 distinct participants."):
        super().__init__(message)


class GHZGenerationError(GHZError):
    """Raised when GHZ quantum circuit generation or simulation fails."""
    pass


class GHZMeasurementError(GHZError):
    """Raised when measurement parameters or basis specifications are invalid."""
    pass


class InvalidBasisError(GHZMeasurementError):
    """Raised when an unsupported measurement basis is specified."""
    def __init__(self, basis: str):
        super().__init__(f"Invalid measurement basis '{basis}'. Supported bases are 'X' and 'Z'.")


class GHZVerificationError(GHZError):
    """Raised when verification cannot be performed due to invalid or missing data."""
    pass
