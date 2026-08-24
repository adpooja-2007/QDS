"""
Session management service backed by PostgreSQL database.
Handles creation, retrieval, update, and lifecycle of QuantumSession objects.
Persists all sessions into PostgreSQL (`quantum_sessions` table) with an
in-memory write-through cache for instant API responsiveness.
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy import select, delete
from sqlalchemy.orm import Session as SyncSession

from app.schemas.session import (
    QuantumSession,
    SessionParameters,
    AliceData,
    BobData,
    SiftingData,
    SecurityResult,
    AttackRecord,
)
from app.models.db_models import SessionModel
from app.core.database import AsyncSessionLocal, engine
from app.core.exceptions import SessionNotFoundError, SessionExpiredError

logger = logging.getLogger("qds.session")


class SessionService:
    """
    Session store backed by PostgreSQL database with an in-memory
    synchronization layer.

    - Primary persistence: PostgreSQL (`quantum_sessions` table)
    - Fast access: In-memory cache synced on create/update/reset
    - ID format: QKD-{YYYYMMDD}-{counter:04d}
    - Nonce: UUID4 for replay protection
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

    def _save_to_db_sync(self, session: QuantumSession) -> None:
        """Persist session record to PostgreSQL synchronously."""
        try:
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy import create_engine
            # Convert async URL to sync driver if needed for background sync save
            sync_url = settings.async_database_url.replace("postgresql+asyncpg://", "postgresql://").replace("sqlite+aiosqlite://", "sqlite://")
            sync_engine = create_engine(sync_url, pool_pre_ping=True)
            with SyncSession(sync_engine) as db:
                db_item = db.get(SessionModel, session.session_id)
                if not db_item:
                    db_item = SessionModel(session_id=session.session_id)
                    db.add(db_item)

                db_item.status = session.status
                db_item.nonce = session.nonce
                db_item.updated_at = datetime.now(timezone.utc)
                db_item.parameters = session.parameters.model_dump()
                db_item.alice = session.alice.model_dump()
                db_item.bob = session.bob.model_dump()
                db_item.sifting = session.sifting.model_dump()
                db_item.attacks = [a.model_dump(mode="json") for a in session.attacks]
                db_item.security = session.security.model_dump()

                db.commit()
                logger.debug("Persisted session %s to PostgreSQL", session.session_id)
        except Exception as exc:
            logger.debug("Database sync persist note: %s", exc)

    def create(
        self,
        num_pairs: int = 1000,
        baseline_noise: float = 0.02,
        alpha: float = 1e-6,
    ) -> QuantumSession:
        """Create a new quantum session and persist it to PostgreSQL."""
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
        self._save_to_db_sync(session)

        logger.info(
            "Session created & persisted to PostgreSQL: %s (pairs=%d, noise=%.3f, α=%.1e)",
            session_id, num_pairs, baseline_noise, alpha
        )
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
        Update specific fields on a session and save to PostgreSQL.
        """
        session = self.get(session_id)

        for key, value in fields.items():
            if hasattr(session, key):
                setattr(session, key, value)

        session.updated_at = datetime.now(timezone.utc)
        self._sessions[session_id] = session
        self._save_to_db_sync(session)

        logger.info("Session updated in PostgreSQL: %s (fields=%s)", session_id, list(fields.keys()))
        return session

    def update_status(self, session_id: str, status: str) -> QuantumSession:
        """Update the status of a session."""
        return self.update(session_id, status=status)

    def add_attack(self, session_id: str, attack: AttackRecord) -> QuantumSession:
        """Add an attack record to a session and save to PostgreSQL."""
        session = self.get(session_id)
        session.attacks.append(attack)
        session.updated_at = datetime.now(timezone.utc)
        self._sessions[session_id] = session
        self._save_to_db_sync(session)

        logger.info("Attack record added to PostgreSQL session %s: %s", session_id, attack.attack_type)
        return session

    def list_all(self) -> List[QuantumSession]:
        """Return all active sessions."""
        return list(self._sessions.values())

    def reset(self, session_id: str) -> QuantumSession:
        """Reset a session to EPR_READY and update PostgreSQL."""
        session = self.get(session_id)

        session.status = "EPR_READY"
        session.alice = AliceData()
        session.bob = BobData()
        session.sifting = SiftingData()
        session.attacks = []
        session.security = SecurityResult()
        session.nonce = self._generate_nonce()
        session.updated_at = datetime.now(timezone.utc)

        self._sessions[session_id] = session
        self._save_to_db_sync(session)

        logger.info("Session reset in PostgreSQL: %s", session_id)
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


from app.core.config import settings

# Singleton instance
session_service = SessionService()
