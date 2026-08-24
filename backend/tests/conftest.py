"""
Shared test fixtures for all test modules.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.session_service import session_service


@pytest.fixture(autouse=True)
def clear_sessions():
    """Clear all sessions before each test."""
    session_service._sessions.clear()
    session_service._counter = 0
    yield
    session_service._sessions.clear()
    session_service._counter = 0


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def session_id(client):
    """Create a session and return its ID."""
    response = client.post(
        "/api/v1/arbitrator/epr-distribute",
        json={"num_pairs": 1000, "baseline_noise": 0.02, "alpha": 1e-6},
    )
    assert response.status_code == 200
    return response.json()["session_id"]



@pytest.fixture
def signed_session(client, session_id):
    """Create a signed session and return its ID."""
    response = client.post(
        "/api/v1/alice/sign",
        json={
            "session_id": session_id,
            "document_hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        },
    )
    assert response.status_code == 200
    return session_id


@pytest.fixture
def measured_session(client, signed_session):
    """Create a measured session and return its ID."""
    response = client.post(
        "/api/v1/bob/verify",
        json={"session_id": signed_session},
    )
    assert response.status_code == 200
    return signed_session


@pytest.fixture
def sifted_session(client, measured_session):
    """Create a sifted session and return its ID."""
    response = client.post(
        "/api/v1/bob/sift",
        json={"session_id": measured_session},
    )
    assert response.status_code == 200
    return measured_session
