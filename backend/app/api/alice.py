"""
Alice node API router.

Alice is the signer node that:
- Signs documents by encoding into quantum states
- Performs Bell measurements
- Sends classical feed-forward bits to Bob
"""

from fastapi import APIRouter

from app.schemas.quantum import (
    SignRequest,
    SignResponse,
    NodeStateResponse,
)
from app.services.quantum_service import quantum_service
from app.services.session_service import session_service

router = APIRouter(
    prefix="/alice",
    tags=["Alice"],
    responses={404: {"description": "Session not found"}},
)


@router.post(
    "/sign",
    response_model=SignResponse,
    summary="Alice signs a document",
    description=(
        "Alice performs the complete quantum signing operation:\n"
        "1. Converts the document hash into binary key bits\n"
        "2. Generates random preparation bases (Z/X)\n"
        "3. Prepares quantum signature states\n"
        "4. Performs Joint Bell Measurement\n"
        "5. Extracts classical feed-forward bits (b1,b2)\n\n"
        "The classical feed-forward bits are sent to Bob through "
        "the classical channel."
    ),
)
async def sign_document(request: SignRequest):
    result = quantum_service.prepare_and_sign(
        session_id=request.session_id,
        document_hash=request.document_hash,
    )

    return SignResponse(
        success=True,
        message="Document signed. Classical feed-forward bits generated.",
        session_id=result["session_id"],
        signature_id=result["signature_id"],
        bell_bits=result["bell_bits"],
        alice_bases=result["alice_bases"],
        num_pairs=result["num_pairs"],
        status=result["status"],
    )


@router.get(
    "/state/{session_id}",
    response_model=NodeStateResponse,
    summary="Get Alice's state for a session",
    description="Retrieve Alice's current data (bits, bases, Bell measurements) for a session.",
)
async def get_alice_state(session_id: str):
    session = session_service.get(session_id)
    return NodeStateResponse(
        success=True,
        message=f"Alice state for session {session_id}",
        session_id=session_id,
        node="Alice",
        status=session.status,
        data={
            "document_hash": session.alice.document_hash,
            "num_bits": len(session.alice.bits),
            "num_bases": len(session.alice.bases),
            "num_bell_measurements": len(session.alice.bell_measurements),
            "bases_distribution": {
                "Z": session.alice.bases.count("Z"),
                "X": session.alice.bases.count("X"),
            } if session.alice.bases else {},
        },
    )
