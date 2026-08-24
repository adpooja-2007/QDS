"""
Security API router.

This connects Module 2 (Threat Detection Engine) to the network.
Provides endpoints for:
- QBER calculation
- Hoeffding threshold calculation
- CHSH Bell inequality test
- Full security audit (the main integration point)
"""

from fastapi import APIRouter

from app.schemas.security import (
    QBERRequest,
    QBERResponse,
    ThresholdRequest,
    ThresholdResponse,
    CHSHRequest,
    CHSHResponse,
    AuditRequest,
    AuditResponse,
    AuditMetrics,
    AuditDecision,
    AuditThreat,
)
from app.services.security_service import security_service

router = APIRouter(
    prefix="/security",
    tags=["Security"],
    responses={404: {"description": "Session not found"}},
)


@router.post(
    "/qber",
    response_model=QBERResponse,
    summary="Calculate QBER from bit arrays",
    description=(
        "Calculate the Quantum Bit Error Rate by comparing Alice's and Bob's "
        "sifted bit arrays. QBER = errors / total_bits. "
        "A low QBER (< threshold) indicates a clean channel."
    ),
)
async def calculate_qber(request: QBERRequest):
    result = security_service.calculate_qber(request.alice_bits, request.bob_bits)

    return QBERResponse(
        success=True,
        message=f"QBER = {result['qber_percentage']:.4f}%",
        error_count=result["error_count"],
        total_bits=result["total_bits"],
        qber=result["qber"],
        qber_percentage=result["qber_percentage"],
    )


@router.post(
    "/threshold",
    response_model=ThresholdResponse,
    summary="Calculate Hoeffding threshold",
    description=(
        "Calculate the statistical security threshold using the Hoeffding bound.\n\n"
        "Formula: T = e0 + √(ln(2/α) / (2N))\n\n"
        "Where:\n"
        "- e0 = baseline expected noise\n"
        "- α = target false-alarm probability\n"
        "- N = sample size (sifted bits)"
    ),
)
async def calculate_threshold(request: ThresholdRequest):
    result = security_service.calculate_threshold(
        sample_size=request.sample_size,
        baseline_qber=request.baseline_qber,
        alpha=request.alpha,
    )

    return ThresholdResponse(
        success=True,
        message=f"Threshold = {result['threshold'] * 100:.4f}%",
        sample_size=result["sample_size"],
        baseline_qber=result["baseline_qber"],
        alpha=result["alpha"],
        delta=result["delta"],
        threshold=result["threshold"],
    )


@router.post(
    "/chsh",
    response_model=CHSHResponse,
    summary="Calculate CHSH Bell inequality score",
    description=(
        "Calculate the CHSH S-value from four correlation coefficients.\n\n"
        "S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|\n\n"
        "Classical bound: S ≤ 2\n"
        "Quantum ideal: S = 2√2 ≈ 2.828"
    ),
)
async def calculate_chsh(request: CHSHRequest):
    correlations = {
        "E_ab": request.correlations.E_ab,
        "E_ab_prime": request.correlations.E_ab_prime,
        "E_a_prime_b": request.correlations.E_a_prime_b,
        "E_a_prime_b_prime": request.correlations.E_a_prime_b_prime,
    }
    result = security_service.calculate_chsh(correlations)

    return CHSHResponse(
        success=True,
        message=f"CHSH S = {result['S']:.4f} → {result['status']}",
        S=result["S"],
        classical_bound=result["classical_bound"],
        quantum_ideal=result["quantum_ideal"],
        status=result["status"],
    )


@router.post(
    "/threshold-audit",
    response_model=AuditResponse,
    summary="Run full security audit on a session",
    description=(
        "The main integration endpoint.\n\n"
        "Performs the complete security analysis pipeline:\n"
        "1. XOR bit-wise comparison\n"
        "2. QBER calculation\n"
        "3. Hoeffding threshold evaluation\n"
        "4. CHSH Bell inequality test\n"
        "5. Deterministic decision gate (ACCEPT/REJECT)\n"
        "6. Threat classification\n\n"
        "This is the endpoint the React dashboard consumes."
    ),
)
async def threshold_audit(request: AuditRequest):
    result = security_service.run_audit(session_id=request.session_id)

    return AuditResponse(
        success=True,
        message=f"Security audit complete: {result['decision']['overall']}",
        session_id=result["session_id"],
        metrics=AuditMetrics(**result["metrics"]),
        decision=AuditDecision(**result["decision"]),
        threat=AuditThreat(**result["threat"]),
    )
