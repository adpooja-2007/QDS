import pytest
import random
from backend.app.quantum.epr import generate_epr_pairs
from backend.app.quantum.state_preparation import prepare_alice_states
from backend.app.quantum.errors import InvalidBitSequence, InvalidBasis

def test_prepare_alice_states_deterministic():
    pairs = generate_epr_pairs("session", 4)
    bits = [0, 1, 0, 1]
    bases = ["Z", "Z", "X", "X"]
    
    states = prepare_alice_states(pairs, bits, bases)
    
    assert len(states) == 4
    assert states[0].state_label == "|0>"
    assert states[1].state_label == "|1>"
    assert states[2].state_label == "|+>"
    assert states[3].state_label == "|->"
    
def test_prepare_alice_states_random():
    random.seed(42)
    pairs = generate_epr_pairs("session", 4)
    bits = [0, 1, 0, 1]
    
    states = prepare_alice_states(pairs, bits)
    assert len(states) == 4
    for state in states:
        assert state.basis in ("X", "Z")

def test_invalid_bits():
    pairs = generate_epr_pairs("session", 1)
    with pytest.raises(InvalidBitSequence):
        prepare_alice_states(pairs, [2], ["Z"])
        
def test_invalid_bases():
    pairs = generate_epr_pairs("session", 1)
    with pytest.raises(InvalidBasis):
        prepare_alice_states(pairs, [0], ["Y"])
