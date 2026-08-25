"""
End-to-end Pipeline & API Integration Tests (Features M2-F22, M2-F23, M2-F24).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.enums import AttackType, SecurityDecision
from app.mock.generator import generate_mock_dataset
from app.engine.orchestrator import analyze_security_transaction

client = TestClient(app)


def test_api_health_endpoint():
    """GET /api/v1/security/health returns healthy."""
    response = client.get("/api/v1/security/health")
    assert response.status_code == 200
    data = response.json()
    assert data["module"] == "deterministic-threat-engine"
    assert data["status"] == "healthy"


def test_mock_scenario_normal_accept():
    """Mock NORMAL scenario produces ACCEPT decision."""
    req = generate_mock_dataset(scenario=AttackType.NONE, key_length=1000, seed=42)
    res = analyze_security_transaction(req)

    assert res.status == "COMPLETED"
    assert res.decision.decision == SecurityDecision.ACCEPT
    assert res.decision.authenticated is True
    assert res.qber_analysis.qber < res.threshold_analysis.threshold
    assert res.chsh_analysis.bell_violation is True


def test_mock_scenario_mitm_reject():
    """Mock MITM scenario produces REJECT decision."""
    req = generate_mock_dataset(scenario=AttackType.MITM, key_length=1000, seed=42)
    res = analyze_security_transaction(req)

    assert res.status == "COMPLETED"
    assert res.decision.decision == SecurityDecision.REJECT
    assert res.decision.authenticated is False
    assert res.diagnostics.classification in (
        AttackType.MITM,
        "MITM_SUSPECTED",
        "MULTIPLE_INDICATORS",
        "HIGH_QBER",
    )


def test_deterministic_reproducibility():
    """Same input -> exact same output telemetry and decision."""
    req1 = generate_mock_dataset(scenario=AttackType.MITM, key_length=500, seed=123)
    req2 = generate_mock_dataset(scenario=AttackType.MITM, key_length=500, seed=123)

    res1 = analyze_security_transaction(req1)
    res2 = analyze_security_transaction(req2)

    assert res1.qber_analysis.qber == res2.qber_analysis.qber
    assert res1.threshold_analysis.threshold == res2.threshold_analysis.threshold
    assert res1.chsh_analysis.score == res2.chsh_analysis.score
    assert res1.decision.decision == res2.decision.decision


def test_api_mock_endpoint():
    """POST /api/v1/security/mock with MITM scenario."""
    payload = {
        "scenario": "mitm",
        "key_length": 1000,
        "baseline_qber": 0.02,
        "attack_fraction": 0.25,
        "seed": 42,
    }
    response = client.post("/api/v1/security/mock", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["decision"]["decision"] == "REJECT"
    assert data["decision"]["authenticated"] is False
    assert "QBER_ABOVE_THRESHOLD" in data["decision"]["reason_codes"] or "CHSH_FAIL" in data["decision"]["reason_codes"]


def test_api_analyze_endpoint_validation_failure():
    """POST /api/v1/security/analyze with length mismatch returns 400."""
    invalid_payload = {
        "session_id": "TEST-ERR-001",
        "block_id": "BLOCK-001",
        "alice": {"bits": [0, 1, 1], "bases": ["Z", "X", "Z"]},
        "bob": {"bits": [0, 1], "bases": ["Z", "X"]},  # Length 2 vs 3
        "channel": {"baseline_qber": 0.02, "attack_fraction": 0.0},
        "security_parameters": {"false_alarm_rate": 1e-9, "minimum_sifted_bits": 5},
        "chsh": {"enabled": True, "correlation_score": 2.72},
    }
    response = client.post("/api/v1/security/analyze", json=invalid_payload)
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["status"] == "INVALID_INPUT"
    assert data["detail"]["error_code"] == "ARRAY_LENGTH_MISMATCH"
