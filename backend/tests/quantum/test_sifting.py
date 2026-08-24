import pytest
from backend.app.quantum.models import AliceState, BobMeasurement
from backend.app.quantum.sifting import sift

def test_sifting():
    alice_states = [
        AliceState("session", 0, 1, "Z", "|1>"),
        AliceState("session", 1, 0, "X", "|+>"),
        AliceState("session", 2, 1, "X", "|->")
    ]
    bob_measurements = [
        BobMeasurement("session", 0, "I", "Z", 1, 1, True),
        BobMeasurement("session", 1, "X", "Z", 0, 0, True),
        BobMeasurement("session", 2, "I", "X", 1, 1, True)
    ]
    
    records = sift(alice_states, bob_measurements)
    
    assert len(records) == 3
    assert records[0].kept is True
    assert records[1].kept is False
    assert records[2].kept is True
