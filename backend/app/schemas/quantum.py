"""
Quantum operation Pydantic schemas.
Request/response models for EPR distribution, Alice signing,
Bob verification, and basis sifting endpoints.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.common import BaseResponse


# ── EPR Distribution ──────────────────────────────────────────────────

class EPRDistributeRequest(BaseModel):
    """Request to generate and distribute EPR pairs."""
    num_pairs: int = Field(
        default=1000, ge=10, le=100000,
        description="Number of entangled EPR pairs to generate"
    )
    baseline_noise: float = Field(
        default=0.02, ge=0.0, le=0.5,
        description="Expected baseline channel noise (e0)"
    )
    alpha: float = Field(
        default=1e-6, gt=0.0, lt=1.0,
        description="Target false-alarm probability (α)"
    )


class EPRDistributeResponse(BaseResponse):
    """Response from EPR pair distribution."""
    session_id: str
    num_pairs: int
    status: str = "EPR_READY"
    nonce: str = ""


# ── Alice Signing ────────────────────────────────────────────────────

class SignRequest(BaseModel):
    """Request for Alice to sign a document."""
    session_id: str = Field(..., description="Active EPR session ID")
    document_hash: str = Field(
        ..., min_length=8, max_length=256,
        description="SHA-256 hash of the document to sign"
    )


class SignResponse(BaseResponse):
    """Response from Alice's signing operation."""
    session_id: str
    signature_id: str
    bell_bits: List[str] = Field(
        ..., description="Classical feed-forward bits (2-bit strings)"
    )
    alice_bases: List[str] = Field(
        ..., description="Alice's randomly chosen preparation bases (Z/X)"
    )
    num_pairs: int
    status: str = "SIGNED"


# ── Bob Verification ─────────────────────────────────────────────────

class VerifyRequest(BaseModel):
    """Request for Bob to verify a signature."""
    session_id: str = Field(..., description="Active EPR session ID")


class VerifyResponse(BaseResponse):
    """Response from Bob's verification (correction + measurement)."""
    session_id: str
    bob_bases: List[str] = Field(
        ..., description="Bob's randomly chosen measurement bases (Z/X)"
    )
    bob_measurements: List[int] = Field(
        ..., description="Bob's measurement outcomes (0 or 1)"
    )
    corrections_applied: List[str] = Field(
        ..., description="Pauli corrections applied (I/X/Z/XZ)"
    )
    num_measured: int
    status: str = "MEASURED"


# ── Basis Sifting ────────────────────────────────────────────────────

class SiftRequest(BaseModel):
    """Request to perform basis sifting."""
    session_id: str = Field(..., description="Active EPR session ID")


class SiftResponse(BaseResponse):
    """Response from basis sifting / reconciliation."""
    session_id: str
    matched_indices: List[int]
    sifted_alice_bits: List[int]
    sifted_bob_bits: List[int]
    sifted_length: int
    discard_rate: float = Field(
        ..., description="Fraction of bits discarded due to basis mismatch"
    )
    status: str = "SIFTED"


# ── Alice/Bob State Query ────────────────────────────────────────────

class NodeStateResponse(BaseResponse):
    """Response for querying a node's current session state."""
    session_id: str
    node: str
    status: str
    data: dict = {}
