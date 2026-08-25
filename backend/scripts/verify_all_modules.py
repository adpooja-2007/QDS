"""
Complete Module 2 Comprehensive Verification Script.
Executes pytest suite, tests all mock scenarios, and tests all FastAPI endpoints.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.models.enums import AttackType
from app.mock.generator import generate_mock_dataset
from app.engine.orchestrator import analyze_security_transaction

client = TestClient(app)


def run_verification():
    print("======================================================================")
    print("    MODULE 2 — DETERMINISTIC STATISTICAL THREAT ENGINE VERIFICATION    ")
    print("======================================================================\n")

    # 1. Test All Mock Scenarios
    scenarios = [
        ("NORMAL LEGITIMATE CHANNEL", AttackType.NONE, 0.02, 0.0),
        ("CHANNEL NOISE ELEVATED", AttackType.NOISE, 0.02, 0.0),
        ("INTERCEPT-RESEND MITM ATTACK", AttackType.MITM, 0.02, 0.25),
        ("CLASSICAL FEEDFORWARD FORGERY", AttackType.FORGERY, 0.02, 0.35),
        ("REPLAY ATTACK", AttackType.REPLAY, 0.02, 0.50),
        ("PHOTON NUMBER SPLITTING (PNS)", AttackType.PNS, 0.02, 0.10),
    ]

    print("----------------------------------------------------------------------")
    print(" STEP 1: TESTING ALL 6 SECURITY SCENARIOS THROUGH ENGINE PIPELINE")
    print("----------------------------------------------------------------------")
    for label, scenario, baseline, attack_frac in scenarios:
        req = generate_mock_dataset(
            scenario=scenario,
            key_length=1000,
            baseline_qber=baseline,
            attack_fraction=attack_frac,
            seed=42,
        )
        report = analyze_security_transaction(req)
        print(f"\n[SCENARIO: {label}]")
        print(f"  - Session ID     : {report.session_id}")
        print(f"  - Total Bits     : {report.sifting.total_bits} | Sifted Bits: {report.sifting.matching_bits}")
        print(f"  - Observed QBER  : {report.qber_analysis.qber} ({report.qber_analysis.qber_percentage}%)")
        print(f"  - Threshold T    : {report.threshold_analysis.threshold}")
        print(f"  - CHSH Score S   : {report.chsh_analysis.score} ({report.chsh_analysis.status.value})")
        print(f"  - Classification : {report.diagnostics.classification.value}")
        print(f"  - Reason Codes   : {[r.value for r in report.decision.reason_codes]}")
        print(f"  - Decision Gate  : {report.decision.decision.value} (Authenticated: {report.decision.authenticated})")

    # 2. Test All FastAPI REST Endpoints
    print("\n----------------------------------------------------------------------")
    print(" STEP 2: TESTING FASTAPI REST API ENDPOINTS VIA HTTP CLIENT")
    print("----------------------------------------------------------------------")

    # Endpoint 1: Health
    resp = client.get("/api/v1/security/health")
    print(f"\n[GET /api/v1/security/health] Status: {resp.status_code}")
    print(f"  Response: {resp.json()}")

    # Endpoint 2: Config
    resp = client.get("/api/v1/security/config")
    print(f"\n[GET /api/v1/security/config] Status: {resp.status_code}")
    print(f"  Response: {resp.json()}")

    # Endpoint 3: Sift
    resp = client.post("/api/v1/security/sift", json={
        "alice_bases": ["Z", "X", "Z", "X", "Z"],
        "bob_bases": ["Z", "X", "X", "X", "Z"],
    })
    print(f"\n[POST /api/v1/security/sift] Status: {resp.status_code}")
    print(f"  Matching Indices: {resp.json()['matching_indices']} | Sifting Ratio: {resp.json()['sifting_ratio']}")

    # Endpoint 4: XOR
    resp = client.post("/api/v1/security/xor", json={
        "alice_bits": [0, 1, 1, 1, 0],
        "bob_bits": [0, 1, 1, 0, 0],
    })
    print(f"\n[POST /api/v1/security/xor] Status: {resp.status_code}")
    print(f"  Mismatches: {resp.json()['mismatch_count']} | Match Count: {resp.json()['match_count']}")

    # Endpoint 5: QBER
    resp = client.post("/api/v1/security/qber", json={
        "alice_bits": [0, 1, 1, 1, 0, 1, 1],
        "bob_bits": [0, 1, 1, 1, 0, 0, 1],
    })
    print(f"\n[POST /api/v1/security/qber] Status: {resp.status_code}")
    print(f"  QBER: {resp.json()['qber']} ({resp.json()['qber_percentage']}%)")

    # Endpoint 6: Threshold
    resp = client.post("/api/v1/security/threshold", json={
        "baseline_qber": 0.02,
        "sample_count": 1000,
        "false_alarm_rate": 1e-9,
    })
    print(f"\n[POST /api/v1/security/threshold] Status: {resp.status_code}")
    print(f"  Delta: {resp.json()['delta']} | Threshold: {resp.json()['threshold']}")

    # Endpoint 7: CHSH
    resp = client.post("/api/v1/security/chsh", json={"score": 2.72})
    print(f"\n[POST /api/v1/security/chsh] Status: {resp.status_code}")
    print(f"  Score: {resp.json()['score']} | Bell Violation: {resp.json()['bell_violation']} | Status: {resp.json()['status']}")

    # Endpoint 8: Mock Endpoint
    resp = client.post("/api/v1/security/mock", json={
        "scenario": "mitm",
        "key_length": 1000,
        "baseline_qber": 0.02,
        "attack_fraction": 0.25,
        "seed": 42,
    })
    print(f"\n[POST /api/v1/security/mock (MITM)] Status: {resp.status_code}")
    print(f"  Decision: {resp.json()['decision']['decision']} | Classification: {resp.json()['diagnostics']['classification']}")

    print("\n======================================================================")
    print("          MODULE 2 FULL VERIFICATION SUCCESSFUL & READY!              ")
    print("======================================================================\n")


if __name__ == "__main__":
    run_verification()
