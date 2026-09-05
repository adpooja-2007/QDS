"""
Independent Unit and Integration Tests for GHZ Quantum Entanglement Module.
"""

import pytest
from qiskit import QuantumCircuit
from starlette.testclient import TestClient

from app.ghz.circuit import create_ghz_circuit, simulate_ghz
from app.ghz.exceptions import (
    GHZError,
    InvalidBasisError,
    InvalidGHZParticipants,
)
from app.ghz.models import BasisType, GHZStateStatus, GHZVerificationDecision
from app.ghz.service import GHZService
from app.main import app


@pytest.fixture
def ghz_service_instance():
    return GHZService()


@pytest.fixture
def client():
    return TestClient(app)


def test_ghz_state_creation(ghz_service_instance):
    """Verify GHZState initialization."""
    state = ghz_service_instance.create_state(shots=1000)
    assert state.ghz_id.startswith("GHZ-")
    assert state.qubit_count == 3
    assert state.shots == 1000
    assert state.status == GHZStateStatus.INITIALIZED


def test_ghz_has_three_qubits(ghz_service_instance):
    """Verify GHZ circuit always has exactly 3 qubits."""
    qc = create_ghz_circuit()
    assert qc.num_qubits == 3
    assert qc.num_clbits == 3


def test_ghz_circuit_structure():
    """Verify H gate on q0, CX(q0, q1), and CX(1, 2) in circuit."""
    qc = create_ghz_circuit(basis=["Z", "Z", "Z"])
    op_names = [inst.operation.name for inst in qc.data]
    assert "h" in op_names
    assert "cx" in op_names
    assert "measure" in op_names


def test_ghz_distribution(ghz_service_instance):
    """Verify distribution to exactly 3 distinct participants."""
    participants = ["alice", "bob", "charlie"]
    state = ghz_service_instance.create_state(participants=participants)
    assert state.status == GHZStateStatus.DISTRIBUTED
    assert state.participants == participants
    assert state.qubit_mapping == {0: "alice", 1: "bob", 2: "charlie"}


def test_invalid_participant_count(ghz_service_instance):
    """Verify rejection when fewer or more than 3 participants are given."""
    with pytest.raises(InvalidGHZParticipants):
        ghz_service_instance.create_state(participants=["alice", "bob"])

    with pytest.raises(InvalidGHZParticipants):
        ghz_service_instance.create_state(participants=["alice", "bob", "charlie", "david"])


def test_duplicate_participants(ghz_service_instance):
    """Verify rejection when duplicate participant identifiers are provided."""
    with pytest.raises(InvalidGHZParticipants):
        ghz_service_instance.create_state(participants=["alice", "alice", "charlie"])


def test_z_measurement(ghz_service_instance):
    """
    Verify Z-basis measurement on ideal circuit yields only |000⟩ and |111⟩ outcomes.
    """
    state = ghz_service_instance.create_state(participants=["alice", "bob", "charlie"], shots=1000)
    measurement = ghz_service_instance.measure(state, basis=["Z", "Z", "Z"], seed=42)

    assert measurement.shots == 1000
    assert measurement.basis == ["Z", "Z", "Z"]
    # In an ideal noiseless GHZ state in Z basis, only "000" and "111" occur
    for bitstring in measurement.raw_counts.keys():
        assert bitstring in ("000", "111")
    assert "000" in measurement.raw_counts
    assert "111" in measurement.raw_counts


def test_x_measurement(ghz_service_instance):
    """
    Verify X-basis measurement on ideal GHZ circuit:
    Under H^⊗3 |GHZ⟩ = 1/2 (|000⟩ + |011⟩ + |101⟩ + |110⟩).
    All valid outcomes MUST have EVEN PARITY (sum of bits % 2 == 0).
    """
    state = ghz_service_instance.create_state(participants=["alice", "bob", "charlie"], shots=1000)
    measurement = ghz_service_instance.measure(state, basis=["X", "X", "X"], seed=42)

    assert measurement.basis == ["X", "X", "X"]
    valid_x_outcomes = {"000", "011", "101", "110"}
    for bitstring in measurement.raw_counts.keys():
        assert bitstring in valid_x_outcomes
        bits = [int(b) for b in bitstring]
        assert sum(bits) % 2 == 0  # Even parity condition


def test_ghz_verification(ghz_service_instance):
    """Verify statistical verification engine derivation."""
    state = ghz_service_instance.create_state(participants=["alice", "bob", "charlie"], shots=1000)
    ghz_service_instance.measure(state, basis=["X", "X", "X"], seed=42)
    verification = ghz_service_instance.verify(state, threshold=0.05)

    assert verification.verified is True
    assert verification.decision == GHZVerificationDecision.PASS
    assert verification.parity_passed is True
    assert verification.error_count == 0
    assert verification.error_rate == 0.0
    assert verification.total_measurements == 1000


def test_qber(ghz_service_instance):
    """Verify QBER calculation on clean and noisy quantum circuits."""
    # Clean circuit
    state_clean = ghz_service_instance.create_state(participants=["alice", "bob", "charlie"], shots=1000)
    ghz_service_instance.measure(state_clean, basis=["Z", "Z", "Z"], seed=42)
    qber_clean = ghz_service_instance.calculate_qber(state_clean)
    assert qber_clean["qber"] == 0.0
    assert qber_clean["verified"] is True

    # Noisy circuit (15% bit-flip noise)
    state_noisy = ghz_service_instance.create_state(
        participants=["alice", "bob", "charlie"],
        shots=1000,
        noise_rate=0.15,
    )
    ghz_service_instance.measure(state_noisy, basis=["Z", "Z", "Z"], seed=42)
    qber_noisy = ghz_service_instance.calculate_qber(state_noisy)
    assert qber_noisy["qber"] > 0.0
    assert qber_noisy["error_count"] > 0


def test_invalid_basis_rejected(ghz_service_instance):
    """Verify rejection of unsupported measurement basis."""
    state = ghz_service_instance.create_state(participants=["alice", "bob", "charlie"])
    with pytest.raises(InvalidBasisError):
        ghz_service_instance.measure(state, basis=["Y", "Z", "Z"])


def test_ghz_api_flow(client):
    """Test full FastAPI endpoint lifecycle for GHZ."""
    # 1. Create
    res_create = client.post(
        "/api/v1/ghz/create",
        json={"participants": ["alice", "bob", "charlie"], "shots": 500},
    )
    assert res_create.status_code == 201
    ghz_id = res_create.json()["ghz_id"]
    assert res_create.json()["status"] == "DISTRIBUTED"

    # 2. Measure
    res_measure = client.post(
        "/api/v1/ghz/measure",
        json={"ghz_id": ghz_id, "basis": ["Z", "Z", "Z"]},
    )
    assert res_measure.status_code == 200
    assert "raw_counts" in res_measure.json()

    # 3. Verify
    res_verify = client.post(
        "/api/v1/ghz/verify",
        json={"ghz_id": ghz_id, "threshold": 0.05},
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["verified"] is True
    assert res_verify.json()["decision"] == "PASS"

    # 4. Get state
    res_get = client.get(f"/api/v1/ghz/{ghz_id}")
    assert res_get.status_code == 200
    assert res_get.json()["has_measurement"] is True
    assert res_get.json()["has_verification"] is True
