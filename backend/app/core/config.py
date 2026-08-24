"""
Core configuration for the FastAPI application.
Centralizes all settings for CORS, API versioning, and app metadata.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables or defaults."""

    # ── Application Metadata ──────────────────────────────────────────
    APP_TITLE: str = "QDS — Quantum Digital Signature Security API"
    APP_DESCRIPTION: str = (
        "Module 3: Distributed Node API Framework for the Quantum-Inspired "
        "Cyber Threat Detection system. Exposes Alice, Bob, Arbitrator, "
        "Security, and Attack endpoints as independent logical nodes."
    )
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    # ── CORS ──────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",   # React default
        "http://localhost:5173",   # Vite default
        "http://localhost:5174",   # Vite alternate
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # ── Quantum Simulation Defaults ───────────────────────────────────
    DEFAULT_NUM_PAIRS: int = 1000
    DEFAULT_BASELINE_NOISE: float = 0.02
    DEFAULT_ALPHA: float = 1e-6
    DEFAULT_CHSH_MINIMUM: float = 2.0

    # ── Telemetry ─────────────────────────────────────────────────────
    TELEMETRY_MAX_ENTRIES: int = 10000

    # ── Session ───────────────────────────────────────────────────────
    SESSION_EXPIRY_SECONDS: int = 3600  # 1 hour

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )



# Singleton instance
settings = Settings()
