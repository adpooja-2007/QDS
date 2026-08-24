"""Tests for the Arbitrator API endpoints."""


class TestEPRDistribute:
    """Tests for POST /api/v1/arbitrator/epr-distribute."""

    def test_create_session(self, client):
        """Should create a new session and return session ID."""
        response = client.post(
            "/api/v1/arbitrator/epr-distribute",
            json={"num_pairs": 500, "baseline_noise": 0.02, "alpha": 1e-6},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["session_id"].startswith("QKD-")
        assert data["num_pairs"] == 500
        assert data["status"] == "EPR_READY"
        assert data["nonce"]  # Should have a nonce

    def test_default_parameters(self, client):
        """Should accept default parameters."""
        response = client.post(
            "/api/v1/arbitrator/epr-distribute",
            json={},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_pairs"] == 1000

    def test_multiple_sessions(self, client):
        """Should create multiple independent sessions."""
        ids = set()
        for _ in range(3):
            response = client.post(
                "/api/v1/arbitrator/epr-distribute",
                json={"num_pairs": 100},
            )
            ids.add(response.json()["session_id"])
        assert len(ids) == 3


class TestGetSession:
    """Tests for GET /api/v1/arbitrator/session/{id}."""

    def test_get_existing_session(self, client, session_id):
        """Should return session details."""
        response = client.get(f"/api/v1/arbitrator/session/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["session"]["session_id"] == session_id
        assert data["session"]["status"] == "EPR_READY"

    def test_get_nonexistent_session(self, client):
        """Should return 404 for nonexistent session."""
        response = client.get("/api/v1/arbitrator/session/QKD-FAKE-0001")
        assert response.status_code == 404


class TestListSessions:
    """Tests for GET /api/v1/arbitrator/sessions."""

    def test_list_empty(self, client):
        """Should return empty list when no sessions exist."""
        response = client.get("/api/v1/arbitrator/sessions")
        assert response.status_code == 200
        assert response.json()["total"] == 0

    def test_list_with_sessions(self, client, session_id):
        """Should return sessions when they exist."""
        response = client.get("/api/v1/arbitrator/sessions")
        assert response.status_code == 200
        assert response.json()["total"] == 1
