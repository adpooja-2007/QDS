"""
Authentication and Chat persistence service.
Provides user management, session validation, and quantum chat storage.
"""

import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from sqlalchemy import select, or_, and_, desc
from app.core.database import get_session
from app.models.db_models import UserModel, ChatMessageModel

logger = logging.getLogger("qds.auth")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


DEFAULT_USERS = [
    {
        "username": "admin",
        "password_hash": hash_password("admin"),
        "display_name": "Security Administrator",
        "role": "Chief Quantum Security Officer",
        "node_id": "#000001",
        "avatar_text": "AD",
        "avatar_bg": "bg-[#181B20]",
        "is_admin": True,
    },
    {
        "username": "alice",
        "password_hash": hash_password("alice"),
        "display_name": "Alice Kovacs",
        "role": "Signer Node Alpha",
        "node_id": "#9042",
        "avatar_text": "AK",
        "avatar_bg": "bg-[#181B20]",
        "is_admin": False,
    },

    {
        "username": "bob",
        "password_hash": hash_password("bob"),
        "display_name": "Bob (Receiver Node Beta)",
        "role": "Receiver Node Beta",
        "node_id": "#260827",
        "avatar_text": "B",
        "avatar_bg": "bg-[#181B20]",
        "is_admin": False,
    },
    {
        "username": "charlie",
        "password_hash": hash_password("charlie"),
        "display_name": "Charlie (Relay Q2)",
        "role": "Quantum Router Q2",
        "node_id": "#881029",
        "avatar_text": "C",
        "avatar_bg": "bg-[#2D3748]",
        "is_admin": False,
    },
    {
        "username": "eve",
        "password_hash": hash_password("eve"),
        "display_name": "Eve (MitM Simulator)",
        "role": "Intercept-Resend Attacker",
        "node_id": "#666999",
        "avatar_text": "⚠",
        "avatar_bg": "bg-terracotta-700",
        "is_admin": False,
    },
]


class AuthService:
    """Service for user authentication and chat message persistence."""

    async def seed_default_users(self):
        """Seed default user accounts if not present."""
        async with get_session() as db:
            for u in DEFAULT_USERS:
                stmt = select(UserModel).where(UserModel.username == u["username"])
                res = await db.execute(stmt)
                user = res.scalar_one_or_none()
                if not user:
                    new_user = UserModel(
                        username=u["username"],
                        password_hash=u["password_hash"],
                        display_name=u["display_name"],
                        role=u["role"],
                        node_id=u["node_id"],
                        avatar_text=u["avatar_text"],
                        avatar_bg=u["avatar_bg"],
                        is_admin=u.get("is_admin", False),
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(new_user)
                else:
                    # Update is_admin if needed
                    user.is_admin = u.get("is_admin", False)
            await db.commit()
            logger.info("Default user accounts verified/seeded.")

    async def register(
        self,
        username: str,
        password: str,
        display_name: Optional[str] = None,
        role: str = "Quantum Node",
    ) -> Optional[UserModel]:
        username = username.strip().lower()
        if not username or not password:
            return None
        async with get_session() as db:
            stmt = select(UserModel).where(UserModel.username == username)
            res = await db.execute(stmt)
            if res.scalar_one_or_none():
                return None  # already exists

            disp = display_name.strip() if display_name else username.capitalize()
            initials = "".join([part[0].upper() for part in disp.split()[:2]]) or username[:2].upper()
            import random
            node_num = random.randint(100000, 999999)
            is_admin = "admin" in role.lower() or username == "admin"
            user = UserModel(
                username=username,
                password_hash=hash_password(password),
                display_name=disp,
                role=role,
                node_id=f"#{node_num}",
                avatar_text=initials,
                avatar_bg="bg-[#181B20]",
                is_admin=is_admin,
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user


    async def authenticate(self, username: str, password: str) -> Optional[UserModel]:
        username = username.strip().lower()
        async with get_session() as db:
            stmt = select(UserModel).where(UserModel.username == username)
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if user and user.password_hash == hash_password(password):
                return user
            return None

    async def list_users(self, exclude_username: Optional[str] = None) -> List[dict]:
        async with get_session() as db:
            stmt = select(UserModel)
            if exclude_username:
                stmt = stmt.where(UserModel.username != exclude_username.strip().lower())
            res = await db.execute(stmt)
            users = res.scalars().all()
            return [u.to_dict() for u in users]

    async def get_user(self, username: str) -> Optional[dict]:
        async with get_session() as db:
            stmt = select(UserModel).where(UserModel.username == username.strip().lower())
            res = await db.execute(stmt)
            u = res.scalar_one_or_none()
            return u.to_dict() if u else None

    async def save_message(
        self,
        sender: str,
        recipient: str,
        text: str,
        session_id: str,
        qds_status: str,
        qber_percentage: float,
        chsh_score: float,
        threshold_percentage: float,
        route_path: List[str],
        is_pass: bool,
        file_name: Optional[str] = None,
        file_type: Optional[str] = None,
        file_size: Optional[int] = None,
        file_data: Optional[str] = None,
    ) -> dict:
        async with get_session() as db:
            msg = ChatMessageModel(
                sender=sender.strip().lower(),
                recipient=recipient.strip().lower(),
                text=text,
                session_id=session_id,
                qds_status=qds_status,
                qber_percentage=qber_percentage,
                chsh_score=chsh_score,
                threshold_percentage=threshold_percentage,
                route_path=route_path or [],
                is_pass=is_pass,
                file_name=file_name,
                file_type=file_type,
                file_size=file_size,
                file_data=file_data,
                timestamp=datetime.now(timezone.utc),
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)
            return msg.to_dict()

    async def get_messages(self, user1: str, user2: str, limit: int = 100) -> List[dict]:
        u1 = user1.strip().lower()
        u2 = user2.strip().lower()
        async with get_session() as db:
            stmt = (
                select(ChatMessageModel)
                .where(
                    or_(
                        and_(ChatMessageModel.sender == u1, ChatMessageModel.recipient == u2),
                        and_(ChatMessageModel.sender == u2, ChatMessageModel.recipient == u1),
                    )
                )
                .order_by(ChatMessageModel.timestamp.asc())
                .limit(limit)
            )
            res = await db.execute(stmt)
            messages = res.scalars().all()
            return [m.to_dict() for m in messages]

    async def get_all_messages(self, limit: int = 200) -> List[dict]:
        """Retrieve all messages across all users for auditing."""
        async with get_session() as db:
            stmt = select(ChatMessageModel).order_by(ChatMessageModel.timestamp.desc()).limit(limit)
            res = await db.execute(stmt)
            messages = res.scalars().all()
            return [m.to_dict() for m in reversed(messages)]

    async def seed_default_chats(self):
        """Seed rich realistic historical chat records between all nodes."""
        async with get_session() as db:
            count_stmt = select(ChatMessageModel)
            res = await db.execute(count_stmt)
            existing = res.scalars().all()
            if len(existing) >= 6:
                return

            sample_chats = [
                # Alice <-> Bob
                {
                    "sender": "alice",
                    "recipient": "bob",
                    "text": "Initial Bell EPR distribution verified. Ready to exchange quantum signed Financial Settlement Agreement QDS-2026-9042.",
                    "session_id": "QKD-20260906-0001",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.18,
                    "chsh_score": 2.78,
                    "threshold_percentage": 14.0,
                    "route_path": ["alice", "Q1-Router", "bob"],
                    "is_pass": True,
                },
                {
                    "sender": "bob",
                    "recipient": "alice",
                    "text": "Pauli frame correction confirmed (σXᵇ¹ · σZᵇ²). Sifting complete with 514/1000 bits. Hoeffding threshold satisfied.",
                    "session_id": "QKD-20260906-0002",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.35,
                    "chsh_score": 2.71,
                    "threshold_percentage": 14.0,
                    "route_path": ["bob", "Q1-Router", "alice"],
                    "is_pass": True,
                },
                {
                    "sender": "alice",
                    "recipient": "bob",
                    "text": "Transferring verified 256-bit quantum one-time-pad token distilled via 2-Universal Toeplitz hash.",
                    "session_id": "QKD-20260906-0003",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 0.95,
                    "chsh_score": 2.84,
                    "threshold_percentage": 14.0,
                    "route_path": ["alice", "Q1-Router", "bob"],
                    "is_pass": True,
                },
                # Alice <-> Charlie
                {
                    "sender": "alice",
                    "recipient": "charlie",
                    "text": "Requesting QuARC routing table sync for Q2 Relay cluster.",
                    "session_id": "QKD-20260906-0004",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.42,
                    "chsh_score": 2.65,
                    "threshold_percentage": 14.0,
                    "route_path": ["alice", "Q2-Relay", "charlie"],
                    "is_pass": True,
                },
                {
                    "sender": "charlie",
                    "recipient": "alice",
                    "text": "QuARC metrics optimal: link fidelity 99.1%, latency 1.2ms. Next hop configured to Bob.",
                    "session_id": "QKD-20260906-0005",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.22,
                    "chsh_score": 2.74,
                    "threshold_percentage": 14.0,
                    "route_path": ["charlie", "Q2-Relay", "alice"],
                    "is_pass": True,
                },
                # Bob <-> Charlie
                {
                    "sender": "bob",
                    "recipient": "charlie",
                    "text": "Relay buffer verification for quantum one-time-pad tokens complete.",
                    "session_id": "QKD-20260906-0006",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.05,
                    "chsh_score": 2.82,
                    "threshold_percentage": 14.0,
                    "route_path": ["bob", "Q2-Relay", "charlie"],
                    "is_pass": True,
                },
                {
                    "sender": "charlie",
                    "recipient": "bob",
                    "text": "Routing path confirmed through Q2-Relay with 99.8% fidelity.",
                    "session_id": "QKD-20260906-0007",
                    "qds_status": "VERIFIED",
                    "qber_percentage": 1.12,
                    "chsh_score": 2.76,
                    "threshold_percentage": 14.0,
                    "route_path": ["charlie", "Q2-Relay", "bob"],
                    "is_pass": True,
                },
                # Alice <-> Eve (Adversarial simulation)
                {
                    "sender": "alice",
                    "recipient": "eve",
                    "text": "Warning: Unauthorized optical probe detected on Fiber Span 03.",
                    "session_id": "QKD-20260906-0008",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 16.13,
                    "chsh_score": 1.72,
                    "threshold_percentage": 14.0,
                    "route_path": ["alice", "Tapped-Fiber", "eve"],
                    "is_pass": False,
                },
                {
                    "sender": "eve",
                    "recipient": "alice",
                    "text": "Adversarial beam-splitter tap active: 40% photon disturbance injected.",
                    "session_id": "QKD-20260906-0009",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 15.80,
                    "chsh_score": 1.68,
                    "threshold_percentage": 14.0,
                    "route_path": ["eve", "Tapped-Fiber", "alice"],
                    "is_pass": False,
                },
                # Bob <-> Eve
                {
                    "sender": "eve",
                    "recipient": "bob",
                    "text": "Attempting unauthorized state forgery on Receiver Node Beta...",
                    "session_id": "QKD-20260906-0010",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 18.42,
                    "chsh_score": 1.55,
                    "threshold_percentage": 14.0,
                    "route_path": ["eve", "Tapped-Fiber", "bob"],
                    "is_pass": False,
                },
                {
                    "sender": "bob",
                    "recipient": "eve",
                    "text": "QDS Security Audit: Hoeffding Bound exceeded! Signature rejected by Bob.",
                    "session_id": "QKD-20260906-0011",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 17.90,
                    "chsh_score": 1.60,
                    "threshold_percentage": 14.0,
                    "route_path": ["bob", "Tapped-Fiber", "eve"],
                    "is_pass": False,
                },
                # Charlie <-> Eve
                {
                    "sender": "eve",
                    "recipient": "charlie",
                    "text": "Intercepting routing packets at Q2-Relay junction.",
                    "session_id": "QKD-20260906-0012",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 19.10,
                    "chsh_score": 1.48,
                    "threshold_percentage": 14.0,
                    "route_path": ["eve", "Tapped-Fiber", "charlie"],
                    "is_pass": False,
                },
                {
                    "sender": "charlie",
                    "recipient": "eve",
                    "text": "QuARC anomaly detector triggered. Link quarantined.",
                    "session_id": "QKD-20260906-0013",
                    "qds_status": "COMPROMISED",
                    "qber_percentage": 18.75,
                    "chsh_score": 1.52,
                    "threshold_percentage": 14.0,
                    "route_path": ["charlie", "Tapped-Fiber", "eve"],
                    "is_pass": False,
                },
            ]


            for sc in sample_chats:
                msg = ChatMessageModel(
                    sender=sc["sender"],
                    recipient=sc["recipient"],
                    text=sc["text"],
                    session_id=sc["session_id"],
                    qds_status=sc["qds_status"],
                    qber_percentage=sc["qber_percentage"],
                    chsh_score=sc["chsh_score"],
                    threshold_percentage=sc["threshold_percentage"],
                    route_path=sc["route_path"],
                    is_pass=sc["is_pass"],
                    timestamp=datetime.now(timezone.utc),
                )
                db.add(msg)
            await db.commit()
            logger.info("Seeded initial quantum chat history across all nodes.")



auth_service = AuthService()
