"""Tests for the Attack Sandbox API endpoints."""


class TestInterceptResend:
    """Tests for POST /api/v1/attacks/intercept-resend."""

    def test_inject_intercept_resend(self, client, measured_session):
        """Should inject MitM attack and cause security audit REJECT."""
        # Inject attack
        attack_res = client.post(
            "/api/v1/attacks/intercept-resend",
            json={
                "session_id": measured_session,
                "attack_fraction": 0.80,
                "basis_strategy": "RANDOM",
            },
        )
        assert attack_res.status_code == 200
        assert attack_res.json()["status"] == "INJECTED"

        # Run audit - should now REJECT or flag threat
        audit_res = client.post(
            "/api/v1/security/threshold-audit",
            json={"session_id": measured_session},
        )
        assert audit_res.status_code == 200
        data = audit_res.json()
        assert data["threat"]["detected"] is True


class TestForgery:
    """Tests for POST /api/v1/attacks/forgery."""

    def test_inject_forgery(self, client, sifted_session):
        """Should inject classical forgery attack."""
        attack_res = client.post(
            "/api/v1/attacks/forgery",
            json={
                "session_id": sifted_session,
                "attack_fraction": 0.20,
            },
        )
        assert attack_res.status_code == 200
        assert attack_res.json()["attack_type"] == "FORGERY"


class TestReplay:
    """Tests for POST /api/v1/attacks/replay."""

    def test_replay_attack_blocked(self, client, session_id):
        """Replay attempt with different session ID should be blocked."""
        # Create second session
        res2 = client.post(
            "/api/v1/arbitrator/epr-distribute",
            json={"num_pairs": 100},
        )
        session_id_2 = res2.json()["session_id"]

        replay_res = client.post(
            "/api/v1/attacks/replay",
            json={
                "session_id": session_id,
                "replay_session_id": session_id_2,
            },
        )
        assert replay_res.status_code == 200
        data = replay_res.json()
        assert data["detected"] is True
        assert data["status"] == "BLOCKED"


class TestNoise:
    """Tests for POST /api/v1/attacks/noise."""

    def test_inject_noise(self, client, measured_session):
        """Should inject channel noise."""
        noise_res = client.post(
            "/api/v1/attacks/noise",
            json={
                "session_id": measured_session,
                "noise_model": "DEPOLARIZING",
                "probability": 0.05,
            },
        )
        assert noise_res.status_code == 200
        assert noise_res.json()["attack_type"] == "NOISE"


class TestPNS:
    """Tests for POST /api/v1/attacks/pns."""

    def test_inject_pns(self, client, measured_session):
        """Should inject PNS attack."""
        pns_res = client.post(
            "/api/v1/attacks/pns",
            json={
                "session_id": measured_session,
                "intensity": 0.25,
            },
        )
        assert pns_res.status_code == 200
        assert pns_res.json()["attack_type"] == "PNS"
