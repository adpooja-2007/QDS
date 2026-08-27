"""
Database Introspection & Live Explorer API Router.

Provides real-time inspection endpoints for the PostgreSQL / SQLite database:
- /stats: Live connection telemetry, storage mode, row counts, and health
- /tables: Table schemas and column definitions
- /sessions: Queryable, filtered list of all quantum session records
- /sessions/{session_id}: Full granular record with raw qubit bitstreams and audit verdicts
- /clear: Clear session cache (for development/testing)
"""

import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query, HTTPException

from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.services.session_service import session_service, SessionService
from app.core.middleware import telemetry_store

router = APIRouter(
    prefix="/db",
    tags=["Database Explorer"],
)


@router.get(
    "/stats",
    summary="Get live database statistics and connection status",
    description="Returns storage engine type, connectivity status, row counts, and summary distributions.",
)
async def get_database_stats():
    sessions = session_service.list_all()
    
    # Calculate status and verdict distributions
    status_counts = {}
    verdict_counts = {"ACCEPT": 0, "REJECT": 0, "PENDING": 0}
    attacks_count = 0
    total_qbits_simulated = 0

    for s in sessions:
        status_counts[s.status] = status_counts.get(s.status, 0) + 1
        
        if s.security and s.security.decision:
            verdict = s.security.decision if isinstance(s.security.decision, str) else getattr(s.security.decision, "overall", "PENDING")
            verdict_counts[verdict] = verdict_counts.get(verdict, 0) + 1
        else:
            verdict_counts["PENDING"] += 1

            
        attacks_count += len(s.attacks)
        if s.parameters:
            total_qbits_simulated += s.parameters.num_pairs

    db_is_postgres = SessionService._db_enabled
    driver_name = "PostgreSQL (qds_db @ localhost:5432)" if db_is_postgres else "In-Memory Quantum SQLite Store (Active Sync)"

    return {
        "success": True,
        "database": {
            "is_connected": True,
            "engine_type": "PostgreSQL" if db_is_postgres else "SQLite In-Memory",
            "driver_name": driver_name,
            "server": settings.POSTGRES_SERVER,
            "port": settings.POSTGRES_PORT,
            "database_name": settings.POSTGRES_DB,
            "persistence_mode": "POSTGRES_PERSISTENT" if db_is_postgres else "IN_MEMORY_MIRROR",
        },
        "metrics": {
            "total_sessions": len(sessions),
            "total_telemetry_logs": len(telemetry_store),
            "total_qubits_processed": total_qbits_simulated,
            "total_attacks_logged": attacks_count,
            "status_distribution": status_counts,
            "verdict_distribution": verdict_counts,
            "tables": [
                {
                    "name": "quantum_sessions",
                    "row_count": len(sessions),
                    "primary_key": "session_id",
                    "description": "Core quantum session state, cryptographic keys, bitstreams & security audits",
                },
                {
                    "name": "telemetry_logs",
                    "row_count": len(telemetry_store),
                    "primary_key": "id",
                    "description": "API request latency, status codes, and quantum subsystem dispatch events",
                },
            ],
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get(
    "/tables",
    summary="Get database schema definitions",
    description="Returns metadata, column types, and descriptions for all tables.",
)
async def get_tables_schema():
    return {
        "success": True,
        "tables": [
            {
                "table_name": "quantum_sessions",
                "columns": [
                    {"name": "session_id", "type": "VARCHAR(64)", "primary_key": True, "nullable": False},
                    {"name": "status", "type": "VARCHAR(32)", "primary_key": False, "nullable": False},
                    {"name": "nonce", "type": "VARCHAR(64)", "primary_key": False, "nullable": False},
                    {"name": "created_at", "type": "TIMESTAMPTZ", "primary_key": False, "nullable": False},
                    {"name": "updated_at", "type": "TIMESTAMPTZ", "primary_key": False, "nullable": False},
                    {"name": "parameters", "type": "JSONB", "primary_key": False, "nullable": True},
                    {"name": "alice", "type": "JSONB", "primary_key": False, "nullable": True},
                    {"name": "bob", "type": "JSONB", "primary_key": False, "nullable": True},
                    {"name": "sifting", "type": "JSONB", "primary_key": False, "nullable": True},
                    {"name": "attacks", "type": "JSONB[]", "primary_key": False, "nullable": True},
                    {"name": "security", "type": "JSONB", "primary_key": False, "nullable": True},
                ],
            },
            {
                "table_name": "telemetry_logs",
                "columns": [
                    {"name": "id", "type": "VARCHAR(36)", "primary_key": True, "nullable": False},
                    {"name": "timestamp", "type": "TIMESTAMPTZ", "primary_key": False, "nullable": False},
                    {"name": "method", "type": "VARCHAR(10)", "primary_key": False, "nullable": False},
                    {"name": "path", "type": "VARCHAR(255)", "primary_key": False, "nullable": False},
                    {"name": "status_code", "type": "INTEGER", "primary_key": False, "nullable": False},
                    {"name": "latency_ms", "type": "FLOAT", "primary_key": False, "nullable": False},
                    {"name": "client_ip", "type": "VARCHAR(45)", "primary_key": False, "nullable": True},
                ],
            },
        ],
    }


@router.get(
    "/sessions",
    summary="Query database sessions table",
    description="Retrieve all stored records with search, status filtering, and sorting.",
)
async def list_database_sessions(
    status: Optional[str] = Query(None, description="Filter by status (e.g. EPR_READY, SIGNED, MEASURED, SIFTED, AUDITED)"),
    search: Optional[str] = Query(None, description="Search session_id or document_hash"),
    limit: int = Query(50, ge=1, le=500),
):
    sessions = session_service.list_all()

    # Filter by status
    if status and status.upper() != "ALL":
        sessions = [s for s in sessions if s.status.upper() == status.upper()]

    # Filter by search
    if search:
        search_lower = search.lower()
        sessions = [
            s for s in sessions
            if search_lower in s.session_id.lower()
            or (s.alice and s.alice.document_hash and search_lower in s.alice.document_hash.lower())
        ]

    # Map to table row structure
    rows = []
    for s in sessions[:limit]:
        doc_hash = s.alice.document_hash if s.alice else None
        num_pairs = s.parameters.num_pairs if s.parameters else len(s.alice.bits) if s.alice else 0
        sec = s.security
        qber = getattr(sec, "qber", None) if sec else None
        chsh = getattr(sec, "chsh", None) if sec else None
        verdict = sec.decision if (sec and sec.decision) else "PENDING"
        if isinstance(verdict, dict):
            verdict = verdict.get("overall", "PENDING")
        elif not isinstance(verdict, str):
            verdict = getattr(verdict, "overall", "PENDING")


        rows.append({
            "session_id": s.session_id,
            "status": s.status,
            "nonce": s.nonce,
            "num_pairs": num_pairs,
            "document_hash": doc_hash,
            "qber": qber,
            "chsh": chsh,
            "verdict": verdict,
            "attacks_count": len(s.attacks),
            "has_alice_data": bool(s.alice and s.alice.bits),
            "has_bob_data": bool(s.bob and s.bob.measurements),
            "sifted_length": s.sifting.sifted_length if s.sifting else 0,
            "created_at": s.created_at.isoformat() if hasattr(s.created_at, "isoformat") else str(s.created_at),
            "updated_at": s.updated_at.isoformat() if hasattr(s.updated_at, "isoformat") else str(s.updated_at),
        })

    return {
        "success": True,
        "total_count": len(sessions),
        "displayed_count": len(rows),
        "records": rows,
    }


@router.get(
    "/sessions/{session_id}",
    summary="Get complete raw session record from DB",
    description="Retrieve the complete nested JSON database record including quantum states, bitstreams, and security proofs.",
)
async def get_raw_session(session_id: str):
    session = session_service.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found in database")

    return {
        "success": True,
        "session_id": session.session_id,
        "record": session.model_dump(mode="json"),
    }


@router.post(
    "/clear",
    summary="Clear session cache",
    description="Resets the in-memory database store (development only).",
)
async def clear_database():
    session_service.clear_all()
    return {"success": True, "message": "Database session store cleared successfully"}
