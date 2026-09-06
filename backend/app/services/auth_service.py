"""
Authentication and Chat persistence service.
Provides user management, session validation, and quantum chat storage.
"""

import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from sqlalchemy import select, or_, and_, desc
from app.core.database import AsyncSessionLocal
from app.models.db_models import UserModel, ChatMessageModel

logger = logging.getLogger("qds.auth")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


DEFAULT_USERS = [
    {
        "username": "alice",
        "password_hash": hash_password("alice"),
        "display_name": "Alice Kovacs",
        "role": "Signer Node Alpha",
        "node_id": "#9042",
        "avatar_text": "AK",
        "avatar_bg": "bg-[#181B20]",
    },
    {
        "username": "bob",
        "password_hash": hash_password("bob"),
        "display_name": "Bob (Receiver Node Beta)",
        "role": "Receiver Node Beta",
        "node_id": "#260827",
        "avatar_text": "B",
        "avatar_bg": "bg-[#181B20]",
    },
    {
        "username": "charlie",
        "password_hash": hash_password("charlie"),
        "display_name": "Charlie (Relay Q2)",
        "role": "Quantum Router Q2",
        "node_id": "#881029",
        "avatar_text": "C",
        "avatar_bg": "bg-[#2D3748]",
    },
    {
        "username": "eve",
        "password_hash": hash_password("eve"),
        "display_name": "Eve (MitM Simulator)",
        "role": "Intercept-Resend Attacker",
        "node_id": "#666999",
        "avatar_text": "⚠",
        "avatar_bg": "bg-terracotta-700",
    },
]


class AuthService:
    """Service for user authentication and chat message persistence."""

    async def seed_default_users(self):
        """Seed default user accounts if not present."""
        async with AsyncSessionLocal() as db:
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
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(new_user)
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
        async with AsyncSessionLocal() as db:
            stmt = select(UserModel).where(UserModel.username == username)
            res = await db.execute(stmt)
            if res.scalar_one_or_none():
                return None  # already exists

            disp = display_name.strip() if display_name else username.capitalize()
            initials = "".join([part[0].upper() for part in disp.split()[:2]]) or username[:2].upper()
            import random
            node_num = random.randint(100000, 999999)
            user = UserModel(
                username=username,
                password_hash=hash_password(password),
                display_name=disp,
                role=role,
                node_id=f"#{node_num}",
                avatar_text=initials,
                avatar_bg="bg-[#181B20]",
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user

    async def authenticate(self, username: str, password: str) -> Optional[UserModel]:
        username = username.strip().lower()
        async with AsyncSessionLocal() as db:
            stmt = select(UserModel).where(UserModel.username == username)
            res = await db.execute(stmt)
            user = res.scalar_one_or_none()
            if user and user.password_hash == hash_password(password):
                return user
            return None

    async def list_users(self, exclude_username: Optional[str] = None) -> List[dict]:
        async with AsyncSessionLocal() as db:
            stmt = select(UserModel)
            if exclude_username:
                stmt = stmt.where(UserModel.username != exclude_username.strip().lower())
            res = await db.execute(stmt)
            users = res.scalars().all()
            return [u.to_dict() for u in users]

    async def get_user(self, username: str) -> Optional[dict]:
        async with AsyncSessionLocal() as db:
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
        async with AsyncSessionLocal() as db:
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
        async with AsyncSessionLocal() as db:
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


auth_service = AuthService()
