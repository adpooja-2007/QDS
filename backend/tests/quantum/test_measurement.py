import pytest
from app.quantum.epr import generate_epr_pairs
from app.quantum.measurement import run_bob_measurement
from app.quantum.errors import InvalidBasis

def test_run_bob_measurement():
    pairs = generate_epr_pairs("session", 2)
    corrections = ["I", "X"]
    bases = ["Z", "X"]
    expected_bits = [0, 1]
    
    measurements = run_bob_measurement(pairs, corrections, bases, expected_bits)
    
    assert len(measurements) == 2
    for m in measurements:
        assert m.session_id == "session"
        assert m.measurement_basis in ("X", "Z")
        assert m.measurement_result in (0, 1)
        assert m.expected_bit in (0, 1)
        assert m.is_match is not None

def test_invalid_basis():
    pairs = generate_epr_pairs("session", 1)
    with pytest.raises(InvalidBasis):
        run_bob_measurement(pairs, ["I"], ["Y"])
