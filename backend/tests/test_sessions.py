"""Tests for Sessions & Telemetry API endpoints."""


class TestSessionsAndTelemetry:
    """Tests for session management and telemetry logging."""

    def test_health_check(self, client):
        """GET /health should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Module 3" in data["module"]

    def test_reset_session(self, client, sifted_session):
        """POST /sessions/{id}/reset should return session to EPR_READY."""
        response = client.post(f"/api/v1/sessions/{sifted_session}/reset")
        assert response.status_code == 200
        data = response.json()
        assert data["session"]["status"] == "EPR_READY"
        assert len(data["session"]["alice"]["bits"]) == 0

    def test_telemetry_recording(self, client):
        """Telemetry log should record API requests."""
        client.get("/health")
        response = client.get("/api/v1/telemetry/")
        assert response.status_code == 200
        data = response.json()
        assert data["total_entries"] > 0
        assert any(e["endpoint"] == "/health" for e in data["entries"])
