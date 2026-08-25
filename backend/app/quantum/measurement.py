import random
from typing import List, Optional
from qiskit.quantum_info import Statevector
from .models import EPRPair, BobMeasurement
from .errors import InvalidBasis, QuantumSimulationError

def run_bob_measurement(
    pairs: List[EPRPair],
    corrections: List[str],
    bases: Optional[List[str]] = None,
    expected_bits: Optional[List[int]] = None
) -> List[BobMeasurement]:
    """Performs Bob's projective measurement on the X or Z basis."""
    if bases is not None:
        if len(bases) != len(pairs):
            raise InvalidBasis("Number of explicit bases must match number of EPR pairs.")
    else:
        bases = [random.choice(["X", "Z"]) for _ in range(len(pairs))]
        
    if len(corrections) != len(pairs):
        raise QuantumSimulationError("Mismatch between pairs and corrections length.")
        
    measurements = []
    
    for i, (pair, correction, basis) in enumerate(zip(pairs, corrections, bases)):
        if basis not in ("X", "Z"):
            raise InvalidBasis(f"Invalid basis '{basis}'. Must be 'X' or 'Z'.")
            
        qc = pair.circuit
        
        # Bob applies H before measurement if in X basis
        if basis == "X":
            qc.h(2)
            
        # Simulate measurement of q2
        sv = Statevector.from_instruction(qc)
        # sv.measure returns outcome as a string.
        outcome, collapsed_sv = sv.measure([2])
        
        result_bit = int(outcome)
        
        expected = None
        is_match = None
        if expected_bits is not None:
            expected = expected_bits[i]
            is_match = (result_bit == expected)
            
        measurements.append(BobMeasurement(
            session_id=pair.session_id,
            pair_index=pair.pair_index,
            correction=correction,
            measurement_basis=basis,
            measurement_result=result_bit,
            expected_bit=expected,
            is_match=is_match
        ))
        
        # No need to preserve the statevector anymore, 
        # but we can update it just in case.
        # However, circuit is done.
        
    return measurements
