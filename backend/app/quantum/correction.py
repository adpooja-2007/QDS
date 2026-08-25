from typing import List
from .models import EPRPair, BellMeasurement
from .errors import QuantumSimulationError

def apply_correction(pairs: List[EPRPair], bell_measurements: List[BellMeasurement]) -> None:
    """Applies Pauli corrections to Bob's EPR half (q2) based on Bell measurement results."""
    
    if len(pairs) != len(bell_measurements):
        raise QuantumSimulationError("Mismatch between number of pairs and bell measurements.")
        
    for pair, meas in zip(pairs, bell_measurements):
        if meas.pair_index != pair.pair_index:
            raise QuantumSimulationError("Pair index mismatch during correction.")
            
        qc = pair.circuit
        correction = meas.correction_required
        
        # Apply correction to q2 (Bob's qubit)
        if correction == "X":
            qc.x(2)
        elif correction == "Z":
            qc.z(2)
        elif correction == "Y":
            qc.y(2)
        elif correction == "I":
            pass # Identity
        else:
            raise QuantumSimulationError(f"Unknown correction: {correction}")
