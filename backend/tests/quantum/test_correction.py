import pytest
from backend.app.quantum.epr import generate_epr_pairs
from backend.app.quantum.models import BellMeasurement
from backend.app.quantum.correction import apply_correction
from backend.app.quantum.errors import QuantumSimulationError

def test_apply_correction():
    pairs = generate_epr_pairs("session", 4)
    # Mock some bell measurements
    measurements = [
        BellMeasurement("session", 0, "00", "I"),
        BellMeasurement("session", 1, "01", "X"),
        BellMeasurement("session", 2, "10", "Z"),
        BellMeasurement("session", 3, "11", "Y"),
    ]
    
    apply_correction(pairs, measurements)
    
    # Check that gates were applied to q2
    assert pairs[1].circuit.data[-1].operation.name == "x"
    assert pairs[1].circuit.data[-1].qubits[0]._index == 2
    
    assert pairs[2].circuit.data[-1].operation.name == "z"
    assert pairs[2].circuit.data[-1].qubits[0]._index == 2
    
    assert pairs[3].circuit.data[-1].operation.name == "y"
    assert pairs[3].circuit.data[-1].qubits[0]._index == 2

def test_apply_correction_mismatch():
    pairs = generate_epr_pairs("session", 1)
    measurements = [BellMeasurement("session", 1, "00", "I")] # wrong pair_index
    with pytest.raises(QuantumSimulationError):
        apply_correction(pairs, measurements)
