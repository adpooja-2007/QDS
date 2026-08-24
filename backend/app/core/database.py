"""
SQLAlchemy PostgreSQL database configuration and session management.
Provides async engine, session maker, and ORM base class.
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger("qds.database")


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# Global engine and sessionmaker instances
engine: AsyncEngine = create_async_engine(
    settings.async_database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def init_db() -> None:
    """Initialize database tables on application startup."""
    global engine, AsyncSessionLocal

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully at %s", settings.async_database_url)
    except Exception as exc:
        logger.warning(
            "Could not connect to PostgreSQL at %s (%s). "
            "Falling back to in-memory SQLite database for offline execution.",
            settings.async_database_url,
            exc,
        )
        # Fallback to SQLite in-memory for zero-friction execution when Postgres is offline
        fallback_url = "sqlite+aiosqlite:///:memory:"
        engine = create_async_engine(fallback_url, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("In-memory SQLite database initialized as fallback.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing a database session to API requests."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
