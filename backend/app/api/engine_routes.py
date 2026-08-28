"""
FastAPI Security Routes for Module 2 Threat Engine (Feature M2-F21).
Namespace: /api/v1/security
"""

from fastapi import APIRouter, HTTPException, status
from app.core.config import settings
from app.engine.exceptions import ThreatEngineException
from app.engine.validation import validate_security_input
from app.engine.sifting import reconcile_and_sift_bases
from app.engine.xor_evaluator import evaluate_xor_matches
from app.engine.qber import calculate_qber
from app.engine.hoeffding import calculate_hoeffding_threshold
from app.engine.chsh import evaluate_chsh_score
from app.engine.decoy import evaluate_decoy_statistics
from app.engine.orchestrator import analyze_security_transaction
from app.mock.generator import generate_mock_dataset
from app.models.input_models import (
    SecurityAnalysisRequest,
    SiftingRequest,
    XORRequest,
    QBERRequest,
    ThresholdRequest,
    CHSHRequest,
    DecoyAnalysisRequest,
    MockScenarioRequest,
    DecoyStateData,
)
from app.models.output_models import (
    SiftingResult,
    XORResult,
    QBERResult,
    ThresholdResult,
    CHSHResult,
    DecoyResult,
    SecurityAuditResponse,
    StandardErrorResponse,
)

router = APIRouter(prefix=settings.API_PREFIX + "/engine", tags=["Security Threat Engine"])


@router.get("/health", summary="Module Health Check")
def get_health():
    """Returns status and version of the Deterministic Threat Engine."""
    return {
        "module": "deterministic-threat-engine",
        "status": "healthy",
        "version": settings.VERSION,
    }


@router.get("/config", summary="Engine Security Parameters")
def get_config():
    """Returns active physical and statistical security thresholds."""
    return settings.model_dump()


@router.post("/sift", response_model=SiftingResult, summary="Basis Reconciliation & Sifting")
def sift_bases(req: SiftingRequest):
    """Reconciles measurement bases and extracts sifted indices."""
    if len(req.alice_bases) != len(req.bob_bases):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "INVALID_INPUT", "error_code": "ARRAY_LENGTH_MISMATCH", "field": "bob_bases"},
        )
    dummy_bits = [0] * len(req.alice_bases)
    return reconcile_and_sift_bases(dummy_bits, req.alice_bases, dummy_bits, req.bob_bases)


@router.post("/xor", response_model=XORResult, summary="XOR Match Evaluator")
def evaluate_xor(req: XORRequest):
    """Computes bitwise XOR between Alice and Bob sifted bits."""
    if len(req.alice_bits) != len(req.bob_bits):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "INVALID_INPUT", "error_code": "ARRAY_LENGTH_MISMATCH", "field": "bob_bits"},
        )
    return evaluate_xor_matches(req.alice_bits, req.bob_bits)


@router.post("/qber", response_model=QBERResult, summary="QBER Calculator")
def get_qber(req: QBERRequest):
    """Calculates Quantum Bit Error Rate (QBER)."""
    if len(req.alice_bits) != len(req.bob_bits):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "INVALID_INPUT", "error_code": "ARRAY_LENGTH_MISMATCH", "field": "bob_bits"},
        )
    xor_res = evaluate_xor_matches(req.alice_bits, req.bob_bits)
    return calculate_qber(xor_res.mismatch_count, xor_res.total_compared)


@router.post("/threshold", response_model=ThresholdResult, summary="Hoeffding Threshold Calculator")
def get_threshold(req: ThresholdRequest):
    """Calculates statistical Hoeffding bound and security threshold."""
    return calculate_hoeffding_threshold(
        baseline_qber=req.baseline_qber,
        sample_count=req.sample_count,
        false_alarm_rate=req.false_alarm_rate,
    )


@router.post("/chsh", response_model=CHSHResult, summary="CHSH Entanglement Evaluator")
def evaluate_chsh(req: CHSHRequest):
    """Evaluates CHSH entanglement correlation score S."""
    return evaluate_chsh_score(score=req.score, enabled=True)


@router.post("/decoy", response_model=DecoyResult, summary="Decoy State Evaluator")
def evaluate_decoy(req: DecoyAnalysisRequest):
    """Evaluates signal vs decoy state error statistics."""
    decoy_data = DecoyStateData(enabled=True, signal=req.signal, decoy=req.decoy)
    return evaluate_decoy_statistics(decoy_data)


@router.post(
    "/analyze",
    response_model=SecurityAuditResponse,
    responses={400: {"model": StandardErrorResponse}},
    summary="Complete Security Analysis Pipeline",
)
def analyze_security(request: SecurityAnalysisRequest):
    """Main security endpoint: executes full deterministic threat analysis pipeline."""
    try:
        return analyze_security_transaction(request)
    except ThreatEngineException as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"status": "INVALID_INPUT", "error_code": exc.code, "message": exc.message, "field": exc.field},
        )


@router.post(
    "/audit",
    response_model=SecurityAuditResponse,
    responses={400: {"model": StandardErrorResponse}},
    summary="Security Audit Report Generator",
)
def audit_security(request: SecurityAnalysisRequest):
    """Generates detailed security audit report for SOC dashboard integration."""
    return analyze_security(request)


@router.post("/mock", response_model=SecurityAuditResponse, summary="Execute Mock Data Scenario")
def run_mock_scenario(req: MockScenarioRequest):
    """Generates synthetic telemetry for a chosen scenario (NONE, NOISE, MITM, FORGERY, REPLAY, PNS) and runs threat analysis."""
    mock_request = generate_mock_dataset(
        scenario=req.scenario,
        key_length=req.key_length,
        baseline_qber=req.baseline_qber,
        attack_fraction=req.attack_fraction,
        seed=req.seed,
    )
    return analyze_security_transaction(mock_request)
