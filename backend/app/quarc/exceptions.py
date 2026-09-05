"""
Exceptions for the QuARC (Quantum Adaptive Routing using Clusters) module.
"""


class QuARCError(Exception):
    """Base exception for all QuARC routing errors."""
    pass


class NodeNotFound(QuARCError):
    """Raised when a requested quantum node is not found in topology."""
    def __init__(self, node_id: str):
        super().__init__(f"Quantum node '{node_id}' not found in topology.")


class LinkNotFound(QuARCError):
    """Raised when a requested quantum link is not found in topology."""
    def __init__(self, source: str, destination: str):
        super().__init__(f"Quantum link between '{source}' and '{destination}' not found.")


class InvalidTopology(QuARCError):
    """Raised when the topology configuration or graph structure is invalid."""
    pass


class RouteNotFound(QuARCError):
    """Raised when no path exists between source and destination satisfying constraints."""
    def __init__(self, source: str, destination: str, reason: str = ""):
        msg = f"No valid route found between '{source}' and '{destination}'."
        if reason:
            msg += f" Reason: {reason}"
        super().__init__(msg)


class RouteUnavailable(QuARCError):
    """Raised when a previously selected route becomes degraded or failed."""
    pass


class RerouteFailed(QuARCError):
    """Raised when adaptive rerouting cannot find a viable alternative path."""
    def __init__(self, source: str, destination: str, failed_path: list):
        super().__init__(f"Rerouting failed from '{source}' to '{destination}' avoiding failed path {failed_path}.")
