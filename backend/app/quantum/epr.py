from typing import List
from qiskit import QuantumCircuit
from .models import EPRPair
from .errors import QuantumSimulationError

def generate_epr_pairs(session_id: str, count: int) -> List[EPRPair]:
    """Generates a requested number of EPR pairs for a session.
    
    Each pair contains a 3-qubit joint quantum circuit where:
    q0: Alice signature
    q1: Alice EPR half
    q2: Bob EPR half
    """
    if count <= 0:
        raise QuantumSimulationError("Pair count must be greater than 0.")
    
    pairs = []
    for i in range(count):
        # Create a 3-qubit circuit with 3 classical bits
        qc = QuantumCircuit(3, 3)
        
        # Prepare EPR pair on q1 and q2 (|Phi+> state)
        qc.h(1)
        qc.cx(1, 2)
        
        pairs.append(EPRPair(
            session_id=session_id,
            pair_index=i,
            bell_state="PHI_PLUS",
            circuit=qc
        ))
    return pairs
