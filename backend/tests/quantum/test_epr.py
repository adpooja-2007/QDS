import pytest
from app.quantum.epr import generate_epr_pairs
from app.quantum.errors import QuantumSimulationError

def test_generate_epr_pairs_success():
    pairs = generate_epr_pairs("test_session", 3)
    assert len(pairs) == 3
    for i, pair in enumerate(pairs):
        assert pair.session_id == "test_session"
        assert pair.pair_index == i
        assert pair.bell_state == "PHI_PLUS"
        assert pair.circuit.num_qubits == 3
        assert pair.circuit.num_clbits == 3

def test_generate_epr_pairs_invalid_count():
    with pytest.raises(QuantumSimulationError):
        generate_epr_pairs("test_session", 0)
