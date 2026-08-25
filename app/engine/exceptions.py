"""
Domain exceptions for Module 2 Threat Engine.
"""


class ThreatEngineException(Exception):
    """Base exception for all Threat Engine errors."""
    def __init__(self, code: str, message: str, field: str | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.field = field


class InvalidBitSequenceError(ThreatEngineException):
    """Raised when bit sequence contains non-binary values."""
    def __init__(self, message: str = "Bit values must strictly be 0 or 1", field: str | None = None):
        super().__init__("INVALID_BIT_VALUE", message, field)


class InvalidBasisError(ThreatEngineException):
    """Raised when basis sequence contains invalid basis identifiers."""
    def __init__(self, message: str = "Bases must strictly be 'Z' or 'X'", field: str | None = None):
        super().__init__("INVALID_BASIS_VALUE", message, field)


class ArrayLengthMismatchError(ThreatEngineException):
    """Raised when array lengths mismatch."""
    def __init__(self, message: str = "Array lengths do not match", field: str | None = None):
        super().__init__("ARRAY_LENGTH_MISMATCH", message, field)


class InsufficientSiftedBitsError(ThreatEngineException):
    """Raised when sifting yields zero or insufficient matching positions."""
    def __init__(self, message: str = "No matching bases found; unable to calculate QBER", field: str | None = None):
        super().__init__("NO_SIFTED_BITS", message, field)


class InvalidParameterError(ThreatEngineException):
    """Raised when parameters fail mathematical boundaries."""
    def __init__(self, message: str = "Parameter value out of valid physical/statistical range", field: str | None = None):
        super().__init__("INVALID_PARAMETER", message, field)
