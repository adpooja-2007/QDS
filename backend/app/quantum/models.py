from dataclasses import dataclass
from typing import Any, Optional
from qiskit import QuantumCircuit

@dataclass
class EPRPair:
    session_id: str
    pair_index: int
    bell_state: str
    # The internal quantum resource representing the joint 3-qubit state 
    # (Alice signature, Alice EPR, Bob EPR).
    circuit: QuantumCircuit
    
@dataclass
class AliceState:
    session_id: str
    pair_index: int
    private_bit: int
    basis: str
    state_label: str

@dataclass
class BellMeasurement:
    session_id: str
    pair_index: int
    bell_result: str
    correction_required: str

@dataclass
class BobMeasurement:
    session_id: str
    pair_index: int
    correction: str
    measurement_basis: str
    measurement_result: int
    expected_bit: Optional[int] = None
    is_match: Optional[bool] = None

@dataclass
class SiftRecord:
    session_id: str
    pair_index: int
    alice_basis: str
    bob_basis: str
    basis_match: bool
    alice_bit: int
    bob_bit: int
    kept: bool
