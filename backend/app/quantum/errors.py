class QuantumSimulationError(Exception):
    """Base exception for all quantum simulation errors."""
    pass

class InvalidBitSequence(QuantumSimulationError):
    """Raised when an invalid bit sequence is provided."""
    pass

class InvalidBasis(QuantumSimulationError):
    """Raised when an invalid basis is provided."""
    pass

class InvalidBellResult(QuantumSimulationError):
    """Raised when a Bell measurement result is invalid."""
    pass

class EPRNotReady(QuantumSimulationError):
    """Raised when EPR pairs are required but not yet prepared."""
    pass

class MeasurementNotFound(QuantumSimulationError):
    """Raised when a measurement result is not found."""
    pass

class SiftingNotComplete(QuantumSimulationError):
    """Raised when sifting results are accessed before sifting is complete."""
    pass

class InternalError(QuantumSimulationError):
    """Raised for unexpected internal errors in the quantum simulation."""
    pass
