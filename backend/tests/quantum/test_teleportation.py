import pytest
from backend.app.quantum.epr import generate_epr_pairs
from backend.app.quantum.teleportation import build_teleportation_circuits

def test_build_teleportation_circuits():
    pairs = generate_epr_pairs("session", 2)
    build_teleportation_circuits(pairs)
    
    for pair in pairs:
        # Check that a barrier was added
        assert pair.circuit.data[-1].operation.name == "barrier"
