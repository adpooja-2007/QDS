"""
Attack sandbox API router.

Red-team attack simulation endpoints for:
- Intercept-Resend (MitM)
- Signature Forgery
- Replay Attack
- Physical Channel Noise
- Photon-Number-Splitting (PNS)

These endpoints inject attacks into active sessions,
modifying the actual quantum/classical data so the security
audit produces authentic detection results.
"""

from fastapi import APIRouter

from app.schemas.attack import (
    InterceptResendRequest,
    ForgeryRequest,
    ReplayRequest,
    NoiseRequest,
    PNSRequest,
    AttackResponse,
    ReplayResponse,
)
from app.services.attack_service import attack_service

router = APIRouter(
    prefix="/attacks",
    tags=["Attacks"],
    responses={404: {"description": "Session not found"}},
)


@router.post(
    "/intercept-resend",
    response_model=AttackResponse,
    summary="Inject an intercept-resend (MitM) attack",
    description=(
        "Simulates Eve intercepting a fraction of qubits in transit, "
        "measuring them in a chosen basis, and resending the post-measurement "
        "state to Bob. When Eve's basis doesn't match Alice's, she introduces "
        "detectable disturbance (QBER increase ~25% of attacked qubits)."
    ),
)
async def intercept_resend(request: InterceptResendRequest):
    result = attack_service.intercept_resend(
        session_id=request.session_id,
        attack_fraction=request.attack_fraction,
        basis_strategy=request.basis_strategy,
    )
    return AttackResponse(**result, success=True, message="Intercept-resend attack injected")


@router.post(
    "/forgery",
    response_model=AttackResponse,
    summary="Inject a classical signature forgery attack",
    description=(
        "Simulates Eve modifying the classical feed-forward bits (b1,b2) "
        "in transit. This forces Bob to apply incorrect Pauli corrections, "
        "causing measurement mismatches and driving up the QBER."
    ),
)
async def forgery(request: ForgeryRequest):
    result = attack_service.forge(
        session_id=request.session_id,
        attack_fraction=request.attack_fraction,
    )
    return AttackResponse(**result, success=True, message="Forgery attack injected")


@router.post(
    "/replay",
    response_model=ReplayResponse,
    summary="Attempt a replay attack",
    description=(
        "Simulates Eve replaying feed-forward data from a previous session "
        "into a new session. The system detects this via session binding "
        "(nonce mismatch) and blocks the attempt."
    ),
)
async def replay(request: ReplayRequest):
    result = attack_service.replay(
        session_id=request.session_id,
        replay_session_id=request.replay_session_id,
    )
    return ReplayResponse(
        **result,
        success=True,
        message="REPLAY DETECTED — attack blocked" if result["detected"]
                else "Replay check passed",
    )


@router.post(
    "/noise",
    response_model=AttackResponse,
    summary="Inject physical channel noise",
    description=(
        "Simulates environmental noise (thermal, phase drift, depolarization) "
        "by probabilistically flipping individual measurement outcomes. "
        "Noise models: DEPOLARIZING, BIT_FLIP, PHASE_FLIP, AMPLITUDE_DAMPING."
    ),
)
async def inject_noise(request: NoiseRequest):
    result = attack_service.inject_noise(
        session_id=request.session_id,
        noise_model=request.noise_model,
        probability=request.probability,
    )
    return AttackResponse(**result, success=True, message="Channel noise injected")


@router.post(
    "/pns",
    response_model=AttackResponse,
    summary="Inject a PNS (Photon-Number-Splitting) attack",
    description=(
        "Simulates Eve exploiting multi-photon pulses by splitting off "
        "one photon, storing it, and sending the remainder to Bob. "
        "Introduces correlated errors detectable through decoy-state analysis."
    ),
)
async def pns_attack(request: PNSRequest):
    result = attack_service.pns(
        session_id=request.session_id,
        intensity=request.intensity,
    )
    return AttackResponse(**result, success=True, message="PNS attack injected")
