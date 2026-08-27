"""Tests for the Bob API endpoints."""


class TestVerify:
    """Tests for POST /api/v1/bob/verify."""

    def test_verify_signature(self, client, signed_session):
        """Should verify and return Bob's measurements."""
        response = client.post(
            "/api/v1/bob/verify",
            json={"session_id": signed_session},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["session_id"] == signed_session
        assert data["status"] == "MEASURED"
        assert len(data["bob_bases"]) == 1000
        assert len(data["bob_measurements"]) == 1000
        assert len(data["corrections_applied"]) == 1000
        assert all(b in ("Z", "X") for b in data["bob_bases"])
        assert all(m in (0, 1) for m in data["bob_measurements"])
        assert all(c in ("I", "X", "Z", "XZ") for c in data["corrections_applied"])


class TestSift:
    """Tests for POST /api/v1/bob/sift."""

    def test_sift_bases(self, client, measured_session):
        """Should sift bases and return matched bits."""
        response = client.post(
            "/api/v1/bob/sift",
            json={"session_id": measured_session},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "SIFTED"
        assert data["sifted_length"] > 0
        assert data["sifted_length"] <= 1000
        # With 2 bases, expect ~50% match rate
        assert 350 <= data["sifted_length"] <= 650
        assert len(data["sifted_alice_bits"]) == data["sifted_length"]
        assert len(data["sifted_bob_bits"]) == data["sifted_length"]
        assert 0.0 <= data["discard_rate"] <= 1.0


class TestBobState:
    """Tests for GET /api/v1/bob/state/{id}."""

    def test_bob_state_after_verify(self, client, measured_session):
        """Should return Bob's data after verification."""
        response = client.get(f"/api/v1/bob/state/{measured_session}")
        assert response.status_code == 200
        data = response.json()
        assert data["node"] == "Bob"
        assert data["data"]["num_measurements"] == 1000

