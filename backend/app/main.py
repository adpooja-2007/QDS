"""
Module 3 — Distributed Node API Framework
Main FastAPI application entry point.

This file:
- Creates the FastAPI application with Swagger metadata
- Configures CORS for the React frontend
- Mounts the telemetry middleware
- Includes all API routers (Alice, Bob, Arbitrator, Security, Attacks, Sessions)
- Provides health check and root redirect
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.middleware import TelemetryMiddleware, telemetry_store
from app.core.exceptions import register_exception_handlers
from app.api import arbitrator, alice, bob, security, attacks, sessions
from app.services.session_service import session_service
from app.schemas.common import HealthResponse

# ── Logging Configuration ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-20s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("qds.main")


# ── Lifespan ─────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("=" * 60)
    logger.info("  QDS — Quantum Digital Signature Security API")
    logger.info("  Module 3: Distributed Node API Framework")
    logger.info("  Version: %s", settings.APP_VERSION)
    logger.info("=" * 60)
    logger.info("Swagger docs available at: http://localhost:8000/docs")
    logger.info("ReDoc available at: http://localhost:8000/redoc")
    yield
    logger.info("Shutting down QDS API...")


# ── FastAPI App ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Arbitrator",
            "description": "🔗 **Trusted third-party node** — EPR distribution, session management, and monitoring.",
        },
        {
            "name": "Alice",
            "description": "✍️ **Signer node** — Document signing, quantum state preparation, and Bell measurement.",
        },
        {
            "name": "Bob",
            "description": "✅ **Verifier node** — Pauli correction, qubit measurement, and basis sifting.",
        },
        {
            "name": "Security",
            "description": "🛡️ **Threat detection** — QBER analysis, Hoeffding threshold, CHSH Bell test, and security audit.",
        },
        {
            "name": "Attacks",
            "description": "⚔️ **Red-team sandbox** — Inject MitM, forgery, replay, noise, and PNS attacks.",
        },
        {
            "name": "Sessions & Telemetry",
            "description": "📊 **Monitoring** — Session lifecycle, telemetry logs, and diagnostics.",
        },
    ],
)


# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# ── Telemetry Middleware ─────────────────────────────────────────────
app.add_middleware(TelemetryMiddleware)


# ── Exception Handlers ───────────────────────────────────────────────
register_exception_handlers(app)


# ── API Routers ──────────────────────────────────────────────────────
app.include_router(arbitrator.router, prefix=settings.API_PREFIX)
app.include_router(alice.router, prefix=settings.API_PREFIX)
app.include_router(bob.router, prefix=settings.API_PREFIX)
app.include_router(security.router, prefix=settings.API_PREFIX)
app.include_router(attacks.router, prefix=settings.API_PREFIX)
app.include_router(sessions.router, prefix=settings.API_PREFIX)


# ── Root & Health ────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to Swagger docs."""
    return RedirectResponse(url="/docs")


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Sessions & Telemetry"],
    summary="Health check",
    description="Returns the API health status, active session count, and telemetry stats.",
)
async def health_check():
    return HealthResponse(
        status="healthy",
        module="Module 3 — Distributed Node API",
        version=settings.APP_VERSION,
        active_sessions=session_service.count(),
        telemetry_entries=len(telemetry_store),
    )
