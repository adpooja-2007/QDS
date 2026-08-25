"""
Threat Analysis Orchestrator (Features M2-F10, M2-F16, M2-F17, M2-F23, M2-F24).
Orchestrates the canonical processing pipeline from validated input to complete audit report.
Pure mathematical workflow, completely deterministic, no side effects.
"""

import time
from app.engine.validation import validate_security_input
from app.engine.sifting import reconcile_and_sift_bases
from app.engine.xor_evaluator import evaluate_xor_matches
from app.engine.qber import calculate_qber
from app.engine.hoeffding import calculate_hoeffding_threshold
from app.engine.chsh import evaluate_chsh_score
from app.engine.decoy import evaluate_decoy_statistics
from app.engine.classifier import classify_attack_condition
from app.engine.decision import evaluate_decision_gate
from app.engine.audit import build_security_audit_report
from app.models.input_models import SecurityAnalysisRequest
from app.models.output_models import SecurityAuditResponse


def analyze_security_transaction(request: SecurityAnalysisRequest) -> SecurityAuditResponse:
    """
    Main entry point for Module 2 Threat Detection Engine.
    Executes the canonical statistical threat detection pipeline:
    Validate -> Sift -> XOR -> QBER -> Hoeffding Threshold -> CHSH -> Decoy -> Classify -> Decision -> Audit Report
    """
    start_time = time.perf_counter()

    # 1. Input Validation (M2-F01)
    validate_security_input(
        alice_bits=request.alice.bits,
        alice_bases=request.alice.bases,
        bob_bits=request.bob.bits,
        bob_bases=request.bob.bases,
        baseline_qber=request.channel.baseline_qber,
        false_alarm_rate=request.security_parameters.false_alarm_rate,
    )

    # 2. Basis Reconciliation & Base Sifting (M2-F02, M2-F03)
    sifting = reconcile_and_sift_bases(
        alice_bits=request.alice.bits,
        alice_bases=request.alice.bases,
        bob_bits=request.bob.bits,
        bob_bases=request.bob.bases,
    )

    # 3. XOR Match Evaluation (M2-F04, M2-F05)
    xor_res = evaluate_xor_matches(
        alice_sifted_bits=sifting.alice_sifted_bits,
        bob_sifted_bits=sifting.bob_sifted_bits,
    )

    # 4. QBER Calculation (M2-F06, M2-F07)
    qber_res = calculate_qber(
        mismatch_count=xor_res.mismatch_count,
        sample_count=xor_res.total_compared,
    )

    # 5. Hoeffding Threshold Calculation (M2-F08, M2-F09)
    threshold_res = calculate_hoeffding_threshold(
        baseline_qber=request.channel.baseline_qber,
        sample_count=xor_res.total_compared,
        false_alarm_rate=request.security_parameters.false_alarm_rate,
    )

    # 6. CHSH Evaluation (M2-F11)
    chsh_res = evaluate_chsh_score(
        score=request.chsh.correlation_score,
        enabled=request.chsh.enabled,
    )

    # 7. Decoy-State Statistics (M2-F12)
    decoy_res = evaluate_decoy_statistics(request.decoy)

    # 8. Attack Classification (M2-F13)
    diagnostics = classify_attack_condition(
        qber_result=qber_res,
        threshold_result=threshold_res,
        chsh_result=chsh_res,
        decoy_result=decoy_res,
        simulator_attack_type=request.attack_type,
    )

    # 9. Deterministic Decision Gate (M2-F14)
    decision = evaluate_decision_gate(
        qber_result=qber_res,
        threshold_result=threshold_res,
        chsh_result=chsh_res,
        decoy_result=decoy_res,
    )

    # 10. Performance Measurement (M2-F24)
    execution_time_ms = (time.perf_counter() - start_time) * 1000.0

    # 11. Build Complete Security Audit Response (M2-F15, M2-F19, M2-F25)
    return build_security_audit_report(
        session_id=request.session_id,
        block_id=request.block_id,
        sifting=sifting,
        error_analysis=xor_res,
        qber_analysis=qber_res,
        threshold_analysis=threshold_res,
        chsh_analysis=chsh_res,
        decoy_analysis=decoy_res,
        decision=decision,
        diagnostics=diagnostics,
        execution_time_ms=execution_time_ms,
    )
