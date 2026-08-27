from typing import List
from .models import AliceState, BobMeasurement, SiftRecord
from .errors import QuantumSimulationError

def sift(
    alice_states: List[AliceState],
    bob_measurements: List[BobMeasurement]
) -> List[SiftRecord]:
    """Basis reconciliation and sifting.
    
    Returns SiftRecords indicating whether the bases matched (kept).
    """
    if len(alice_states) != len(bob_measurements):
        raise QuantumSimulationError("Mismatch in number of states/measurements for sifting.")
        
    sift_records = []
    
    for alice, bob in zip(alice_states, bob_measurements):
        if alice.pair_index != bob.pair_index:
            raise QuantumSimulationError(f"Pair index mismatch: {alice.pair_index} != {bob.pair_index}")
            
        is_match = (alice.basis == bob.measurement_basis)
        
        sift_records.append(SiftRecord(
            session_id=alice.session_id,
            pair_index=alice.pair_index,
            alice_basis=alice.basis,
            bob_basis=bob.measurement_basis,
            basis_match=is_match,
            alice_bit=alice.private_bit,
            bob_bit=bob.measurement_result,
            kept=is_match
        ))
        
    return sift_records
