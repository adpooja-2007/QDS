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
            "Could not connect to database at %s (%s). "
            "Falling back to local SQLite database for offline execution.",
            settings.async_database_url,
            exc,
        )
        # Fallback to local SQLite for zero-friction execution
        fallback_url = "sqlite+aiosqlite:///./qds.db"
        engine = create_async_engine(fallback_url, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Local SQLite database initialized as fallback.")

    # Migrate columns if needed (e.g. SQLite newly added file columns)
    try:
        async with engine.begin() as conn:
            for col_def in [
                ("file_name", "VARCHAR(256)"),
                ("file_type", "VARCHAR(128)"),
                ("file_size", "INTEGER"),
                ("file_data", "TEXT"),
            ]:
                try:
                    await conn.exec_driver_sql(f"ALTER TABLE chat_messages ADD COLUMN {col_def[0]} {col_def[1]}")
                except Exception:
                    pass  # Column already exists
    except Exception as mig_err:
        logger.debug("Migration check: %s", mig_err)

    # Seed default user accounts (alice, bob, charlie, eve)
    try:
        from app.services.auth_service import auth_service
        await auth_service.seed_default_users()
    except Exception as seed_err:
        logger.warning("Could not seed default users: %s", seed_err)


def get_session() -> AsyncSession:
    """Return an async session from the currently active sessionmaker."""
    return AsyncSessionLocal()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing a database session to API requests."""
    async with get_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

