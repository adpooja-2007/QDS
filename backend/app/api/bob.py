"""
Bob node API router.

Bob is the verifier node that:
- Receives Alice's classical feed-forward bits
- Applies Pauli corrections to his EPR qubits
- Chooses random measurement bases
- Measures the reconstructed quantum states
"""

from fastapi import APIRouter

from app.schemas.quantum import (
    VerifyRequest,
    VerifyResponse,
    SiftRequest,
    SiftResponse,
    NodeStateResponse,
)
from app.services.quantum_service import quantum_service
from app.services.session_service import session_service

router = APIRouter(
    prefix="/bob",
    tags=["Bob"],
    responses={404: {"description": "Session not found"}},
)


@router.post(
    "/verify",
    response_model=VerifyResponse,
    summary="Bob verifies a signature",
    description=(
        "Bob performs the complete verification operation:\n"
        "1. Receives Alice's classical feed-forward bits\n"
        "2. Applies Pauli correction (I/X/Z/XZ) based on Bell outcomes\n"
        "3. Chooses random measurement bases (Z/X)\n"
        "4. Measures the corrected qubits\n\n"
        "After this step, basis sifting can be performed to compare results."
    ),
)
async def verify_signature(request: VerifyRequest):
    result = quantum_service.verify(session_id=request.session_id)

    return VerifyResponse(
        success=True,
        message="Verification complete. Bob measured all qubits.",
        session_id=result["session_id"],
        bob_bases=result["bob_bases"],
        bob_measurements=result["bob_measurements"],
        corrections_applied=result["corrections_applied"],
        num_measured=result["num_measured"],
        status=result["status"],
    )


@router.post(
    "/sift",
    response_model=SiftResponse,
    summary="Perform basis sifting",
    description=(
        "Compare Alice's and Bob's measurement bases. "
        "Discard qubit pairs where they chose different bases. "
        "The remaining 'sifted' bits form the shared key for security analysis."
    ),
)
async def sift_bases(request: SiftRequest):
    result = quantum_service.sift(session_id=request.session_id)

    return SiftResponse(
        success=True,
        message=f"Basis sifting complete. {result['sifted_length']} bits retained.",
        session_id=result["session_id"],
        matched_indices=result["matched_indices"],
        sifted_alice_bits=result["sifted_alice_bits"],
        sifted_bob_bits=result["sifted_bob_bits"],
        sifted_length=result["sifted_length"],
        discard_rate=result["discard_rate"],
        status=result["status"],
    )


@router.get(
    "/state/{session_id}",
    response_model=NodeStateResponse,
    summary="Get Bob's state for a session",
    description="Retrieve Bob's current data (bases, measurements, corrections) for a session.",
)
async def get_bob_state(session_id: str):
    session = session_service.get(session_id)
    return NodeStateResponse(
        success=True,
        message=f"Bob state for session {session_id}",
        session_id=session_id,
        node="Bob",
        status=session.status,
        data={
            "num_bases": len(session.bob.bases),
            "num_measurements": len(session.bob.measurements),
            "num_corrections": len(session.bob.corrections),
            "bases_distribution": {
                "Z": session.bob.bases.count("Z"),
                "X": session.bob.bases.count("X"),
            } if session.bob.bases else {},
            "correction_distribution": {
                "I": session.bob.corrections.count("I"),
                "X": session.bob.corrections.count("X"),
                "Z": session.bob.corrections.count("Z"),
                "XZ": session.bob.corrections.count("XZ"),
            } if session.bob.corrections else {},
        },
    )
