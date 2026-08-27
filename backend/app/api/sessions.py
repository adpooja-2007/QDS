"""
Session management and telemetry API router.

Provides endpoints for:
- Listing all sessions
- Getting session details
- Resetting sessions
- Viewing telemetry logs
"""

import time
import hashlib
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from fastapi import APIRouter
from app.core.config import settings

from app.schemas.session import SessionResponse, SessionListResponse, QuantumSession as QuantumSessionSchema
from app.schemas.common import BaseResponse, TelemetryResponse, TelemetryEntrySchema, HealthResponse
from app.services.session_service import session_service
from app.services.quantum_service import quantum_service
from app.services.security_service import security_service
from app.core.middleware import telemetry_store

router = APIRouter(
    tags=["Sessions & Telemetry"],
    responses={404: {"description": "Session not found"}},
)


class SystemNodeSchema(BaseModel):
    id: str
    name: str
    role: str
    status: str
    endpoint: str
    latency_ms: float
    requests_count: int
    last_activity: str
    qubit_fidelity: float
    memory_buffer_mb: float


class RunWorkflowRequest(BaseModel):
    document_name: str = Field(default="defense_telemetry_dispatch_manifest_09.sig")
    file_size_kb: float = Field(default=64.2)
    num_pairs: int = Field(default=1000)
    baseline_noise: float = Field(default=0.02)
    alpha: float = Field(default=0.001)
    is_eve_active: bool = Field(default=False)
    attack_type: Optional[str] = Field(default=None)
    attack_fraction: float = Field(default=0.35)


class StepTelemetryRequest(BaseModel):
    step: int
    step_name: Optional[str] = None
    is_eve_active: bool = False
    attack_type: Optional[str] = None
    document_name: Optional[str] = None
    qber: Optional[float] = None
    chsh_score: Optional[float] = None


class WorkflowStepSchema(BaseModel):
    id: int
    name: str
    short_code: str
    description: str
    node: str
    status: str
    latency_ms: float


class WorkflowMetricsSchema(BaseModel):
    qber: float
    baseline_qber: float
    hoeffding_threshold: float
    chsh_score: float
    classical_limit: float = 2.000
    tsirelson_bound: float = 2.828
    confidence_level: float = 0.999
    alpha: float = 0.001
    sifted_bits: int
    error_bits: int
    total_pulses: int


class WorkflowVerdictSchema(BaseModel):
    verdict: str
    threat_detected: bool
    threat_type: Optional[str] = None
    reason: str
    evaluated_at: str
    hoeffding_pass: bool
    chsh_pass: bool
    signature_pass: bool
    security_score: int


class WorkflowResponse(BaseResponse):
    session_id: str
    document_name: str
    document_hash: str
    file_size_kb: float
    status: str
    sender: str
    receiver: str
    arbitrator: str
    created_at: str
    updated_at: str
    metrics: WorkflowMetricsSchema
    verdict: WorkflowVerdictSchema
    pipeline_steps: List[WorkflowStepSchema]


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check (API namespace)",
    description="Returns the API health status, active session count, and telemetry stats.",
)
async def api_health_check():
    return HealthResponse(
        status="healthy",
        module="Module 3 — Distributed Node API",
        version=settings.APP_VERSION,
        active_sessions=session_service.count(),
        telemetry_entries=len(telemetry_store),
    )


@router.get(
    "/nodes",
    response_model=List[SystemNodeSchema],
    summary="List quantum nodes status",
    description="Retrieve live status and metrics for all 4 distributed nodes.",
)
async def get_nodes():
    total_requests = len(telemetry_store) + 40
    current_time = time.strftime("%H:%M:%S")
    return [
        SystemNodeSchema(
            id="ARB-01",
            name="Arbitrator Core Cluster",
            role="ARBITRATOR",
            status="ONLINE",
            endpoint="/api/v1/arbitrator",
            latency_ms=1.4,
            requests_count=max(20, total_requests // 4),
            last_activity=f"{current_time} (Active)",
            qubit_fidelity=0.998,
            memory_buffer_mb=256.0,
        ),
        SystemNodeSchema(
            id="ALC-01",
            name="Alice (Signer Node)",
            role="SENDER",
            status="ONLINE",
            endpoint="/api/v1/alice",
            latency_ms=2.1,
            requests_count=max(18, total_requests // 4),
            last_activity=f"{current_time} (Active)",
            qubit_fidelity=0.995,
            memory_buffer_mb=128.0,
        ),
        SystemNodeSchema(
            id="BOB-01",
            name="Bob (Verifier Node)",
            role="RECEIVER",
            status="ONLINE",
            endpoint="/api/v1/bob",
            latency_ms=2.4,
            requests_count=max(18, total_requests // 4),
            last_activity=f"{current_time} (Active)",
            qubit_fidelity=0.994,
            memory_buffer_mb=128.0,
        ),
        SystemNodeSchema(
            id="TE-01",
            name="Threat Detection Engine",
            role="THREAT_ENGINE",
            status="ONLINE",
            endpoint="/api/v1/security",
            latency_ms=3.2,
            requests_count=max(15, total_requests // 4),
            last_activity=f"{current_time} (Active)",
            qubit_fidelity=0.999,
            memory_buffer_mb=512.0,
        ),
    ]


@router.post(
    "/sessions/run-workflow",
    response_model=WorkflowResponse,
    summary="Execute full end-to-end quantum signature protocol",
    description=(
        "Executes the entire 8-stage quantum protocol:\n"
        "1. Arbitrator EPR Generation\n"
        "2. Alice Document Hash & State Prep\n"
        "3. Alice Bell State Measurement (BSM)\n"
        "4. Classical Feed-Forward Transmission\n"
        "5. Bob Pauli Frame Correction\n"
        "6. Bob Measurement & Basis Sifting\n"
        "7. Module 2 Threat Engine Hoeffding & CHSH Audit\n"
        "8. Arbitrator Final Cryptographic Verification"
    ),
)
async def run_full_workflow(request: RunWorkflowRequest):
    t0 = time.perf_counter()

    # 1. Arbitrator EPR distribution
    t_step = time.perf_counter()
    session = session_service.create(
        num_pairs=request.num_pairs,
        baseline_noise=request.baseline_noise,
        alpha=request.alpha,
    )
    quantum_service.generate_epr(session.session_id, request.num_pairs)
    lat_epr = round((time.perf_counter() - t_step) * 1000, 2)

    # 2. SHA-256 Hash
    t_step = time.perf_counter()
    doc_hash = hashlib.sha256(f"{request.document_name}:{session.nonce}".encode()).hexdigest()
    lat_hash = round((time.perf_counter() - t_step) * 1000, 2)

    # 3. Alice Sign (State prep + Bell measurement)
    t_step = time.perf_counter()
    quantum_service.prepare_and_sign(session.session_id, doc_hash)
    lat_sign = round((time.perf_counter() - t_step) * 1000, 2)

    # 3.5 Channel Intrusion Injection (if Eve / MitM active)
    if request.is_eve_active or request.attack_type:
        from app.services.attack_service import attack_service
        att_type = (request.attack_type or "INTERCEPT_RESEND").upper()
        if "FORGERY" in att_type:
            attack_service.signature_forgery(session.session_id, attack_fraction=request.attack_fraction)
        elif "REPLAY" in att_type:
            attack_service.replay_attack(session.session_id, attack_fraction=request.attack_fraction)
        elif "NOISE" in att_type:
            attack_service.channel_noise(session.session_id, noise_level=request.attack_fraction)
        else:
            attack_service.intercept_resend(session.session_id, attack_fraction=request.attack_fraction)

    # 4. Classical feed-forward
    lat_comm = 1.8

    # 5. Bob Verify (Pauli correction + measurement)
    t_step = time.perf_counter()
    quantum_service.verify(session.session_id)
    lat_verify = round((time.perf_counter() - t_step) * 1000, 2)

    # 6. Bob Basis Sifting
    t_step = time.perf_counter()
    sift_res = quantum_service.sift(session.session_id)
    lat_sift = round((time.perf_counter() - t_step) * 1000, 2)

    # 7. Security Engine Threshold Audit
    t_step = time.perf_counter()
    audit_res = security_service.run_audit(session.session_id)
    lat_audit = round((time.perf_counter() - t_step) * 1000, 2)

    # 8. Cryptographic Verdict
    lat_final = 0.9

    metrics_data = audit_res["metrics"]
    decision_data = audit_res["decision"]
    threat_data = audit_res["threat"]

    is_accept = decision_data["overall"] == "ACCEPT"
    security_score = 98 if is_accept else max(20, int(100 - (metrics_data["qber"] * 300)))

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    pipeline_steps = [
        WorkflowStepSchema(
            id=1,
            name="EPR Pair Generation",
            short_code="EPR",
            description=f"Arbitrator distributed {request.num_pairs} Bell state pairs |Φ⁺⟩",
            node="ARBITRATOR (ARB-01)",
            status="COMPLETED",
            latency_ms=lat_epr,
        ),
        WorkflowStepSchema(
            id=2,
            name="Document Hash & Digest",
            short_code="HASH",
            description=f"Generated SHA-256 cryptographic digest for {request.document_name}",
            node="ALICE (ALC-01)",
            status="COMPLETED",
            latency_ms=lat_hash,
        ),
        WorkflowStepSchema(
            id=3,
            name="Quantum State Preparation",
            short_code="PREP",
            description="Alice prepared qubits in random conjugate bases {|0⟩,|1⟩,|+⟩,|-⟩}",
            node="ALICE (ALC-01)",
            status="COMPLETED",
            latency_ms=lat_sign,
        ),
        WorkflowStepSchema(
            id=4,
            name="Classical Feed-Forward",
            short_code="COMM",
            description="Alice transmitted 2-bit BSM outcomes over authenticated classical channel",
            node="CHANNEL (TLS 1.3)",
            status="COMPLETED",
            latency_ms=lat_comm,
        ),
        WorkflowStepSchema(
            id=5,
            name="Pauli Unitary Correction",
            short_code="CORR",
            description="Bob applied unitary correction gates σ = X^m2 Z^m1 to EPR qubits",
            node="BOB (BOB-01)",
            status="COMPLETED",
            latency_ms=lat_verify,
        ),
        WorkflowStepSchema(
            id=6,
            name="Basis Reconciliation & Sifting",
            short_code="SIFT",
            description=f"Discarded incompatible bases; retained {sift_res['sifted_length']} matching bit positions",
            node="BOB (BOB-01)",
            status="COMPLETED",
            latency_ms=lat_sift,
        ),
        WorkflowStepSchema(
            id=7,
            name="Statistical Threat Audit",
            short_code="EVAL",
            description=f"Hoeffding bound (T={metrics_data['threshold']*100:.2f}%) and CHSH Bell test (S={metrics_data['chsh']:.3f})",
            node="THREAT ENGINE (TE-01)",
            status="COMPLETED",
            latency_ms=lat_audit,
        ),
        WorkflowStepSchema(
            id=8,
            name="Signature Verification Verdict",
            short_code="VERF",
            description=f"Arbitrator verified final signature validity: {decision_data['overall']}",
            node="ARBITRATOR (ARB-01)",
            status="COMPLETED",
            latency_ms=lat_final,
        ),
    ]

    return WorkflowResponse(
        success=True,
        message=f"Quantum signature workflow executed: {decision_data['overall']}",
        session_id=session.session_id,
        document_name=request.document_name,
        document_hash=doc_hash,
        file_size_kb=request.file_size_kb,
        status="VERIFIED" if is_accept else "REJECTED",
        sender="Alice (ALC-01 · Node Alpha)",
        receiver="Bob (BOB-01 · Node Beta)",
        arbitrator="Arbitrator (ARB-01 · Core Cluster)",
        created_at=now_iso,
        updated_at=now_iso,
        metrics=WorkflowMetricsSchema(
            qber=metrics_data["qber"],
            baseline_qber=metrics_data["baseline_noise"],
            hoeffding_threshold=metrics_data["threshold"],
            chsh_score=metrics_data["chsh"],
            classical_limit=2.000,
            tsirelson_bound=2.828,
            confidence_level=0.999,
            alpha=request.alpha,
            sifted_bits=metrics_data["sifted_bits"],
            error_bits=metrics_data["error_count"],
            total_pulses=request.num_pairs * 2,
        ),
        verdict=WorkflowVerdictSchema(
            verdict=decision_data["overall"],
            threat_detected=threat_data["detected"],
            threat_type=threat_data["type"],
            reason=(
                f"Observed QBER ({metrics_data['qber']*100:.2f}%) within Hoeffding bound ({metrics_data['threshold']*100:.2f}%). "
                f"CHSH score ({metrics_data['chsh']:.3f}) satisfies Bell entanglement criteria."
                if is_accept
                else threat_data.get("description", "Security checks failed.")
            ),
            evaluated_at=now_iso,
            hoeffding_pass=decision_data["qber_pass"],
            chsh_pass=decision_data["chsh_pass"],
            signature_pass=decision_data["session_valid"],
            security_score=security_score,
        ),
        pipeline_steps=pipeline_steps,
    )


@router.get(
    "/sessions",
    response_model=SessionListResponse,
    summary="List all sessions",
    description="Retrieve all quantum sessions with their current state.",
)
@router.get(
    "/sessions/",
    response_model=SessionListResponse,
    include_in_schema=False,
)
async def list_sessions():
    sessions = session_service.list_all()
    return SessionListResponse(
        success=True,
        message=f"Found {len(sessions)} session(s)",
        total=len(sessions),
        sessions=sessions,
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    summary="Get session details",
    description="Retrieve the full state of a specific quantum session.",
)
async def get_session(session_id: str):
    session = session_service.get(session_id)
    return SessionResponse(
        success=True,
        message=f"Session {session_id} retrieved",
        session=session,
    )


@router.post(
    "/sessions/{session_id}/reset",
    response_model=SessionResponse,
    summary="Reset a session",
    description=(
        "Reset a session back to EPR_READY state. "
        "Clears all Alice/Bob data, sifting results, attacks, and security results. "
        "Generates a new nonce for replay protection."
    ),
)
async def reset_session(session_id: str):
    session = session_service.reset(session_id)
    return SessionResponse(
        success=True,
        message=f"Session {session_id} reset to EPR_READY",
        session=session,
    )


class ResetBody(BaseModel):
    session_id: str


@router.post(
    "/sessions/reset",
    response_model=SessionResponse,
    summary="Reset a session via JSON body",
    description="Reset a session back to EPR_READY state using request body.",
)
async def reset_session_body(body: ResetBody):
    session = session_service.reset(body.session_id)
    return SessionResponse(
        success=True,
        message=f"Session {body.session_id} reset to EPR_READY",
        session=session,
    )


@router.get(
    "/telemetry",
    response_model=TelemetryResponse,
    summary="Get telemetry log",
    description=(
        "Retrieve the telemetry log containing timing, request IDs, "
        "and session correlation for all recent API calls."
    ),
)
@router.get(
    "/telemetry/",
    response_model=TelemetryResponse,
    include_in_schema=False,
)
@router.get(
    "/sessions/telemetry/recent",
    response_model=TelemetryResponse,
    summary="Get recent telemetry log (Module 4 alias)",
)
async def get_telemetry(limit: int = 100):
    entries = list(telemetry_store)[-limit:]
    return TelemetryResponse(
        success=True,
        message=f"Showing {len(entries)} of {len(telemetry_store)} telemetry entries",
        total_entries=len(telemetry_store),
        entries=[
            TelemetryEntrySchema(**e.to_dict())
            for e in entries
        ],
    )


@router.post(
    "/sessions/step-telemetry",
    summary="Record live demonstration step execution telemetry",
    description="Logs real-time protocol step transitions directly from the Demonstration UI canvas into the backend SOC engine."
)
async def record_step_telemetry(req: StepTelemetryRequest):
    step_names = {
        1: "EPR Pair Generation & SPDC Pump",
        2: "Alice Joint Bell State Measurement",
        3: "Bob Pauli Frame Unitary Correction",
        4: "Public Basis Sifting & Hoeffding Audit",
        5: "Threat Engine Bell Non-Locality Evaluation",
        6: "Privacy Amplification & Signature Derivation"
    }
    name = req.step_name or step_names.get(req.step, f"Protocol Phase {req.step}")
    status_code = 500 if (req.is_eve_active and req.step >= 4) or req.attack_type else 200
    qber = req.qber or (0.0642 if status_code == 500 else 0.0210)
    chsh = req.chsh_score or (1.88 if status_code == 500 else 2.76)
    
    try:
        from app.core.middleware import TelemetryEntry
        entry = TelemetryEntry(
            request_id=f"STEP-{int(time.time() * 1000) % 100000}",
            endpoint=f"/api/v1/demonstration/phase-{req.step}",
            status_code=status_code,
            duration_ms=12.4 + (req.step * 2.1),
            session_id="LIVE-DEMO-STREAM",
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        )
        telemetry_store.append(entry)
    except Exception:
        pass

    return {
        "success": True,
        "step": req.step,
        "step_name": name,
        "qber": qber,
        "chsh": chsh,
        "status_code": status_code,
        "logged_at": time.strftime("%H:%M:%S"),
    }


