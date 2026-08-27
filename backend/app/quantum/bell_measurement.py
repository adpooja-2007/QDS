from typing import List
from qiskit.quantum_info import Statevector
from qiskit import QuantumCircuit
from .models import EPRPair, BellMeasurement
from .constants import BELL_CORRECTIONS
from .errors import QuantumSimulationError

def run_bell_measurement(pairs: List[EPRPair]) -> List[BellMeasurement]:
    """Performs Bell measurement on Alice's two qubits (q0, q1) and collapses the state.
    
    Normalizes the measurement outcome into the public convention:
    b1b2 where b1 is q0 (Alice signature) and b2 is q1 (Alice EPR half).
    """
    measurements = []
    
    for pair in pairs:
        qc = pair.circuit
        
        # Apply Bell measurement operations
        qc.cx(0, 1)
        qc.h(0)
        
        # Evolve the circuit to a statevector
        sv = Statevector.from_instruction(qc)
        
        # Measure q0 and q1.
        # Qiskit returns the outcome string in little-endian order for the specified qubits.
        # sv.measure([0, 1]) returns a string 'q1q0' where q1 is the measurement of qubit 1 
        # and q0 is the measurement of qubit 0.
        outcome, collapsed_sv = sv.measure([0, 1])
        
        # Normalize to public contract "b1b2" where b1=q0 and b2=q1
        # Reverse the Qiskit outcome 'q1q0' to get 'q0q1'
        bell_result = outcome[::-1]
        
        # Determine correction required
        if bell_result not in BELL_CORRECTIONS:
            raise QuantumSimulationError(f"Invalid Bell result obtained: {bell_result}")
            
        correction = BELL_CORRECTIONS[bell_result]
        
        # Re-initialize the pair's circuit with the collapsed statevector 
        # to preserve the joint quantum state for Bob.
        new_qc = QuantumCircuit(3, 3)
        new_qc.initialize(collapsed_sv, [0, 1, 2])
        pair.circuit = new_qc
        
        measurements.append(BellMeasurement(
            session_id=pair.session_id,
            pair_index=pair.pair_index,
            bell_result=bell_result,
            correction_required=correction
        ))
        
    return measurements
