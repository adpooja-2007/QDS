"""
SQLAlchemy ORM models for PostgreSQL database persistence.
Defines tables for SessionModel and TelemetryModel.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import String, Integer, Float, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SessionModel(Base):
    """
    SQLAlchemy ORM model for persisting QuantumSession records to PostgreSQL.

    Table: quantum_sessions
    """
    __tablename__ = "quantum_sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="CREATED", index=True)
    nonce: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Structured JSON columns matching Pydantic schemas
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    alice: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    bob: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    sifting: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    attacks: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    security: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    def to_pydantic_dict(self) -> dict:
        """Convert database ORM record to dict compatible with QuantumSession Pydantic model."""
        return {
            "session_id": self.session_id,
            "status": self.status,
            "nonce": self.nonce,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "parameters": self.parameters or {},
            "alice": self.alice or {},
            "bob": self.bob or {},
            "sifting": self.sifting or {},
            "attacks": self.attacks or [],
            "security": self.security or {},
        }


class TelemetryModel(Base):
    """
    SQLAlchemy ORM model for persisting telemetry logs to PostgreSQL.

    Table: telemetry_logs
    """
    __tablename__ = "telemetry_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_id: Mapped[str] = mapped_column(String(64), index=True)
    endpoint: Mapped[str] = mapped_column(String(256), index=True)
    method: Mapped[str] = mapped_column(String(16))
    timestamp: Mapped[str] = mapped_column(String(64))
    execution_time_ms: Mapped[float] = mapped_column(Float)
    status_code: Mapped[int] = mapped_column(Integer)
    session_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def to_dict(self) -> dict:
        return {
            "request_id": self.request_id,
            "endpoint": self.endpoint,
            "method": self.method,
            "timestamp": self.timestamp,
            "execution_time_ms": round(self.execution_time_ms, 3),
            "status_code": self.status_code,
            "session_id": self.session_id,
            "error": self.error,
        }


class GHZSessionModel(Base):
    """
    SQLAlchemy ORM model for persisting 3-qubit GHZ entanglement instances.
    Table: ghz_sessions
    """
    __tablename__ = "ghz_sessions"

    ghz_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    qubit_count: Mapped[int] = mapped_column(Integer, default=3)
    status: Mapped[str] = mapped_column(String(32), default="INITIALIZED", index=True)
    participants: Mapped[List[str]] = mapped_column(JSON, default=list)
    qubit_mapping: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    shots: Mapped[int] = mapped_column(Integer, default=1000)
    noise_rate: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    measurement: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    verification: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)


class QuantumNodeModel(Base):
    """
    SQLAlchemy ORM model for persisting Quantum Nodes in topology.
    Table: quantum_nodes
    """
    __tablename__ = "quantum_nodes"

    node_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), default="")
    node_type: Mapped[str] = mapped_column(String(32), default="ROUTER")
    status: Mapped[str] = mapped_column(String(32), default="ONLINE", index=True)
    capacity: Mapped[int] = mapped_column(Integer, default=100)
    cluster_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)


class QuantumLinkModel(Base):
    """
    SQLAlchemy ORM model for persisting Quantum Links in topology.
    Table: quantum_links
    """
    __tablename__ = "quantum_links"

    link_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(64), index=True)
    destination: Mapped[str] = mapped_column(String(64), index=True)
    distance: Mapped[float] = mapped_column(Float, default=1.0)
    fidelity: Mapped[float] = mapped_column(Float, default=0.98)
    latency: Mapped[float] = mapped_column(Float, default=1.0)
    capacity: Mapped[int] = mapped_column(Integer, default=50)
    success_probability: Mapped[float] = mapped_column(Float, default=0.95)
    error_rate: Mapped[float] = mapped_column(Float, default=0.02)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", index=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)


class RoutingDecisionModel(Base):
    """
    SQLAlchemy ORM model for persisting QuARC routing decisions.
    Table: routing_decisions
    """
    __tablename__ = "routing_decisions"

    decision_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(64), index=True)
    destination: Mapped[str] = mapped_column(String(64), index=True)
    selected_path: Mapped[List[str]] = mapped_column(JSON, default=list)
    score: Mapped[float] = mapped_column(Float)
    metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    reason: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

