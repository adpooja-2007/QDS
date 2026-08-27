import pytest
from unittest.mock import patch
from qiskit.quantum_info import Statevector
from app.quantum.epr import generate_epr_pairs
from app.quantum.bell_measurement import run_bell_measurement
from app.quantum.constants import BELL_CORRECTIONS
from app.quantum.errors import QuantumSimulationError

def test_run_bell_measurement_success():
    pairs = generate_epr_pairs("session", 4)
    measurements = run_bell_measurement(pairs)
    
    assert len(measurements) == 4
    for m in measurements:
        assert m.session_id == "session"
        assert m.bell_result in BELL_CORRECTIONS
        assert m.correction_required == BELL_CORRECTIONS[m.bell_result]

@pytest.mark.parametrize("qiskit_outcome,expected_public_result,expected_correction", [
    ("00", "00", "I"),
    ("10", "01", "X"),
    ("01", "10", "Z"),
    ("11", "11", "Y"),
])
def test_normalization(qiskit_outcome, expected_public_result, expected_correction):
    """
    Qiskit measure([0, 1]) returns 'q1q0'. 
    If qiskit returns '10', it means q1=1, q0=0.
    The public result 'b1b2' maps to q0q1. So q0=0, q1=1 -> '01'.
    This test mocks Statevector.measure to ensure we reverse the string correctly.
    """
    pairs = generate_epr_pairs("session", 1)
    
    with patch.object(Statevector, 'measure', return_value=(qiskit_outcome, Statevector.from_label('000'))):
        measurements = run_bell_measurement(pairs)
        
        assert len(measurements) == 1
        assert measurements[0].bell_result == expected_public_result
        assert measurements[0].correction_required == expected_correction

def test_invalid_bell_result():
    pairs = generate_epr_pairs("session", 1)
    
    with patch.object(Statevector, 'measure', return_value=("20", Statevector.from_label('000'))):
        with pytest.raises(QuantumSimulationError):
            run_bell_measurement(pairs)
