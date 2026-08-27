from typing import List, Optional
from .models import EPRPair, AliceState, BellMeasurement, BobMeasurement, SiftRecord
from .epr import generate_epr_pairs
from .state_preparation import prepare_alice_states
from .teleportation import build_teleportation_circuits
from .bell_measurement import run_bell_measurement
from .correction import apply_correction
from .measurement import run_bob_measurement
from .sifting import sift

class QuantumService:
    """Service boundary for Module 1."""
    
    @staticmethod
    def generate_epr(session_id: str, count: int) -> List[EPRPair]:
        return generate_epr_pairs(session_id, count)
        
    @staticmethod
    def prepare_signature(
        pairs: List[EPRPair], 
        bits: List[int], 
        bases: Optional[List[str]] = None
    ) -> List[AliceState]:
        return prepare_alice_states(pairs, bits, bases)
        
    @staticmethod
    def run_bell_measurement(pairs: List[EPRPair]) -> List[BellMeasurement]:
        build_teleportation_circuits(pairs)
        return run_bell_measurement(pairs)
        
    @staticmethod
    def apply_correction(
        pairs: List[EPRPair], 
        bell_measurements: List[BellMeasurement]
    ) -> None:
        apply_correction(pairs, bell_measurements)
        
    @staticmethod
    def measure(
        pairs: List[EPRPair],
        corrections: List[str],
        bases: Optional[List[str]] = None,
        expected_bits: Optional[List[int]] = None
    ) -> List[BobMeasurement]:
        return run_bob_measurement(pairs, corrections, bases, expected_bits)
        
    @staticmethod
    def sift(
        alice_states: List[AliceState],
        bob_measurements: List[BobMeasurement]
    ) -> List[SiftRecord]:
        return sift(alice_states, bob_measurements)
