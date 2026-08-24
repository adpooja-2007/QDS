"""Tests for the Alice API endpoints."""


class TestSign:
    """Tests for POST /api/v1/alice/sign."""

    def test_sign_document(self, client, session_id):
        """Should sign a document and return Bell bits."""
        response = client.post(
            "/api/v1/alice/sign",
            json={
                "session_id": session_id,
                "document_hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["session_id"] == session_id
        assert data["status"] == "SIGNED"
        assert len(data["bell_bits"]) == 1000
        assert len(data["alice_bases"]) == 1000
        assert all(bb in ("00", "01", "10", "11") for bb in data["bell_bits"])
        assert all(b in ("Z", "X") for b in data["alice_bases"])

    def test_sign_requires_epr_ready(self, client):
        """Should fail if session doesn't exist."""
        response = client.post(
            "/api/v1/alice/sign",
            json={
                "session_id": "QKD-FAKE-9999",
                "document_hash": "a1b2c3d4e5f6a7b8",
            },
        )
        assert response.status_code == 404


class TestAliceState:
    """Tests for GET /api/v1/alice/state/{id}."""

    def test_alice_state_before_sign(self, client, session_id):
        """Should return empty Alice data before signing."""
        response = client.get(f"/api/v1/alice/state/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["node"] == "Alice"
        assert data["data"]["num_bits"] == 0

    def test_alice_state_after_sign(self, client, signed_session):
        """Should return Alice's data after signing."""
        response = client.get(f"/api/v1/alice/state/{signed_session}")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["num_bits"] == 1000
        assert data["data"]["num_bases"] == 1000

