import pytest
from app.quantum.service import QuantumService

def test_end_to_end_states():
    """End-to-End test for |0>, |1>, |+>, |-> as requested by the spec."""
    session_id = "e2e_test"
    count = 4
    
    # 1. EPR Preparation
    pairs = QuantumService.generate_epr(session_id, count)
    
    # 2. State Preparation: |0>, |1>, |+>, |->
    bits = [0, 1, 0, 1]
    bases = ["Z", "Z", "X", "X"]
    alice_states = QuantumService.prepare_signature(pairs, bits, bases)
    
    # 3. Bell Measurement
    bell_measurements = QuantumService.run_bell_measurement(pairs)
    
    # 4. Correction
    QuantumService.apply_correction(pairs, bell_measurements)
    
    # 5. Bob Measurement (Using the same bases as Alice)
    corrections = [m.correction_required for m in bell_measurements]
    bob_measurements = QuantumService.measure(pairs, corrections, bases, expected_bits=bits)
    
    # 6. Verify teleportation correctness
    for b_meas, expected_bit in zip(bob_measurements, bits):
        assert b_meas.is_match is True
        assert b_meas.measurement_result == expected_bit
        
    # 7. Sifting
    sift_records = QuantumService.sift(alice_states, bob_measurements)
    
    assert len(sift_records) == 4
    for record in sift_records:
        assert record.kept is True

def test_pair_lineage():
    """Test pair lineage for N=8 pairs to ensure consistent index mapping."""
    session_id = "lineage"
    count = 8
    
    pairs = QuantumService.generate_epr(session_id, count)
    bits = [1, 0, 1, 0, 1, 0, 1, 0]
    alice_bases = ["Z", "X", "Z", "X", "Z", "X", "Z", "X"]
    bob_bases = ["Z", "Z", "X", "X", "Z", "X", "Z", "X"] # Some mismatches
    
    alice_states = QuantumService.prepare_signature(pairs, bits, alice_bases)
    bell_measurements = QuantumService.run_bell_measurement(pairs)
    QuantumService.apply_correction(pairs, bell_measurements)
    
    corrections = [m.correction_required for m in bell_measurements]
    bob_measurements = QuantumService.measure(pairs, corrections, bob_bases, expected_bits=bits)
    
    sift_records = QuantumService.sift(alice_states, bob_measurements)
    
    for i in range(8):
        assert pairs[i].pair_index == i
        assert alice_states[i].pair_index == i
        assert bell_measurements[i].pair_index == i
        assert bob_measurements[i].pair_index == i
        assert sift_records[i].pair_index == i
        
        # Verify sifting correctly identified matches
        expected_match = (alice_bases[i] == bob_bases[i])
        assert sift_records[i].kept == expected_match
