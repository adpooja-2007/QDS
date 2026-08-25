import random
from typing import List, Optional
from .models import EPRPair, AliceState
from .errors import InvalidBitSequence, InvalidBasis

def prepare_alice_states(
    pairs: List[EPRPair],
    bits: List[int],
    bases: Optional[List[str]] = None
) -> List[AliceState]:
    """Prepares Alice's signature states into the provided EPR pairs' circuits.
    
    Operates on q0 of each pair's joint circuit.
    """
    if len(bits) != len(pairs):
        raise InvalidBitSequence("Number of bits must match number of EPR pairs.")
        
    if bases is not None:
        if len(bases) != len(pairs):
            raise InvalidBasis("Number of explicit bases must match number of EPR pairs.")
    else:
        bases = [random.choice(["X", "Z"]) for _ in range(len(pairs))]
        
    alice_states = []
    
    for i, (pair, bit, basis) in enumerate(zip(pairs, bits, bases)):
        if bit not in (0, 1):
            raise InvalidBitSequence(f"Invalid bit '{bit}'. Must be 0 or 1.")
        
        if basis not in ("X", "Z"):
            raise InvalidBasis(f"Invalid basis '{basis}'. Must be 'X' or 'Z'.")
            
        # q0 is Alice's signature state
        qc = pair.circuit
        
        # State mapping
        if basis == "Z":
            state_label = "|1>" if bit == 1 else "|0>"
            if bit == 1:
                qc.x(0)
        else: # basis == "X"
            state_label = "|->" if bit == 1 else "|+>"
            if bit == 1:
                qc.x(0)
            qc.h(0)
            
        alice_states.append(AliceState(
            session_id=pair.session_id,
            pair_index=pair.pair_index,
            private_bit=bit,
            basis=basis,
            state_label=state_label
        ))
        
    return alice_states
