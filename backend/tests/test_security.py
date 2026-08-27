"""Tests for the Security API endpoints."""


class TestQBER:
    """Tests for POST /api/v1/security/qber."""

    def test_zero_qber(self, client):
        """Identical bits should yield 0 QBER."""
        response = client.post(
            "/api/v1/security/qber",
            json={"alice_bits": [0, 1, 0, 1], "bob_bits": [0, 1, 0, 1]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["error_count"] == 0
        assert data["qber"] == 0.0

    def test_non_zero_qber(self, client):
        """1 mismatch in 4 bits should yield 0.25 QBER."""
        response = client.post(
            "/api/v1/security/qber",
            json={"alice_bits": [0, 1, 0, 1], "bob_bits": [0, 1, 1, 1]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["error_count"] == 1
        assert data["qber"] == 0.25
        assert data["qber_percentage"] == 25.0


class TestThreshold:
    """Tests for POST /api/v1/security/threshold."""

    def test_calculate_threshold(self, client):
        """Should calculate Hoeffding threshold correctly."""
        response = client.post(
            "/api/v1/security/threshold",
            json={"sample_size": 1000, "baseline_qber": 0.02, "alpha": 1e-6},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["baseline_qber"] == 0.02
        assert data["delta"] > 0
        assert data["threshold"] > data["baseline_qber"]


class TestCHSH:
    """Tests for POST /api/v1/security/chsh."""

    def test_quantum_chsh(self, client):
        """Quantum S value > 2 should pass Bell test."""
        response = client.post(
            "/api/v1/security/chsh",
            json={
                "correlations": {
                    "E_ab": 0.707,
                    "E_ab_prime": -0.707,
                    "E_a_prime_b": 0.707,
                    "E_a_prime_b_prime": 0.707,
                }
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["S"] > 2.0
        assert data["status"] == "ENTANGLEMENT_PRESENT"


class TestThresholdAudit:
    """Tests for POST /api/v1/security/threshold-audit."""

    def test_clean_session_audit_accept(self, client, sifted_session):
        """A clean sifted session should be ACCEPTED."""
        response = client.post(
            "/api/v1/security/threshold-audit",
            json={"session_id": sifted_session},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["decision"]["overall"] == "ACCEPT"
        assert data["decision"]["qber_pass"] is True
        assert data["threat"]["detected"] is False
