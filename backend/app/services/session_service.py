"""
Session management service.
Handles creation, retrieval, update, and lifecycle of QuantumSession objects.
Uses in-memory storage for the prototype; can be swapped for a database later.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.schemas.session import (
    QuantumSession,
    SessionParameters,
    AliceData,
    BobData,
    SiftingData,
    SecurityResult,
    AttackRecord,
)
from app.core.exceptions import SessionNotFoundError, SessionExpiredError
from app.core.config import settings

logger = logging.getLogger("qds.session")


class SessionService:
    """
    In-memory session store that manages the lifecycle of quantum sessions.

    Session ID format: QKD-{YYYYMMDD}-{counter:04d}
    Nonce: UUID4 for replay protection
    """

    def __init__(self):
        self._sessions: Dict[str, QuantumSession] = {}
        self._counter: int = 0

    def _generate_session_id(self) -> str:
        """Generate a unique session ID."""
        self._counter += 1
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        return f"QKD-{date_str}-{self._counter:04d}"

    def _generate_nonce(self) -> str:
        """Generate a cryptographic nonce for session binding."""
        return str(uuid.uuid4())

    def create(
        self,
        num_pairs: int = 1000,
        baseline_noise: float = 0.02,
        alpha: float = 1e-6,
    ) -> QuantumSession:
        """
        Create a new quantum session.

        Args:
            num_pairs: Number of EPR pairs to generate.
            baseline_noise: Expected baseline channel noise (e0).
            alpha: Target false-alarm probability.

        Returns:
            A new QuantumSession in CREATED status.
        """
        session_id = self._generate_session_id()
        nonce = self._generate_nonce()
        now = datetime.now(timezone.utc)

        session = QuantumSession(
            session_id=session_id,
            status="CREATED",
            created_at=now,
            updated_at=now,
            nonce=nonce,
            parameters=SessionParameters(
                num_pairs=num_pairs,
                baseline_noise=baseline_noise,
                alpha=alpha,
            ),
            alice=AliceData(),
            bob=BobData(),
            sifting=SiftingData(),
            attacks=[],
            security=SecurityResult(),
        )

        self._sessions[session_id] = session
        logger.info("Session created: %s (pairs=%d, noise=%.3f, α=%.1e)",
                     session_id, num_pairs, baseline_noise, alpha)
        return session

    def get(self, session_id: str) -> QuantumSession:
        """
        Retrieve a session by ID.

        Raises:
            SessionNotFoundError: If the session does not exist.
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(session_id)
        return self._sessions[session_id]

    def update(self, session_id: str, **fields) -> QuantumSession:
        """
        Update specific fields on a session.

        Args:
            session_id: The session to update.
            **fields: Key-value pairs to update on the session.

        Returns:
            The updated session.
        """
        session = self.get(session_id)

        for key, value in fields.items():
            if hasattr(session, key):
                setattr(session, key, value)

        session.updated_at = datetime.now(timezone.utc)
        self._sessions[session_id] = session
        logger.info("Session updated: %s (fields=%s)", session_id, list(fields.keys()))
        return session

    def update_status(self, session_id: str, status: str) -> QuantumSession:
        """Update the status of a session."""
        return self.update(session_id, status=status)

    def add_attack(self, session_id: str, attack: AttackRecord) -> QuantumSession:
        """Add an attack record to a session."""
        session = self.get(session_id)
        session.attacks.append(attack)
        session.updated_at = datetime.now(timezone.utc)
        self._sessions[session_id] = session
        logger.info("Attack added to session %s: %s", session_id, attack.attack_type)
        return session

    def list_all(self) -> List[QuantumSession]:
        """Return all sessions."""
        return list(self._sessions.values())

    def reset(self, session_id: str) -> QuantumSession:
        """
        Reset a session to its EPR_READY state, clearing all
        Alice/Bob data, sifting, attacks, and security results.
        """
        session = self.get(session_id)
        num_pairs = session.parameters.num_pairs

        session.status = "EPR_READY"
        session.alice = AliceData()
        session.bob = BobData()
        session.sifting = SiftingData()
        session.attacks = []
        session.security = SecurityResult()
        session.nonce = self._generate_nonce()
        session.updated_at = datetime.now(timezone.utc)

        self._sessions[session_id] = session
        logger.info("Session reset: %s", session_id)
        return session

    def close(self, session_id: str) -> QuantumSession:
        """Mark a session as CLOSED."""
        return self.update_status(session_id, "CLOSED")

    def count(self) -> int:
        """Return the number of active sessions."""
        return len(self._sessions)

    def exists(self, session_id: str) -> bool:
        """Check if a session exists."""
        return session_id in self._sessions


# ── Singleton instance ────────────────────────────────────────────────
session_service = SessionService()
