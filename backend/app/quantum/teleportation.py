from typing import List
from .models import EPRPair

def build_teleportation_circuits(pairs: List[EPRPair]) -> None:
    """Prepares the teleportation circuit for each pair.
    
    The circuit represents:
    q0 = Alice signature
    q1 = Alice EPR half
    q2 = Bob EPR half
    
    The joint 3-qubit system is already initialized and Alice's state 
    is prepared on q0 and the EPR pair is on q1, q2. This function simply 
    adds a barrier to conceptually separate the preparation from the Bell 
    measurement phase.
    """
    for pair in pairs:
        pair.circuit.barrier()
