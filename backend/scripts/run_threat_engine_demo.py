"""
Demonstration CLI script for Module 2 Threat Engine.
Runs mock scenarios (NORMAL, NOISE, MITM, FORGERY, REPLAY, PNS) and displays threat analysis results.
"""

import sys
import json
import argparse
from app.models.enums import AttackType
from app.mock.generator import generate_mock_dataset
from app.engine.orchestrator import analyze_security_transaction


def main():
    parser = argparse.ArgumentParser(description="Module 2 Threat Engine Demo CLI")
    parser.add_argument(
        "--scenario",
        type=str,
        default="mitm",
        choices=["none", "normal", "noise", "mitm", "forgery", "replay", "pns"],
        help="Scenario type to run",
    )
    parser.add_argument("--key-length", type=int, default=1000, help="Number of bits to test")
    args = parser.parse_args()

    scenario_str = args.scenario.lower()
    if scenario_str in ("none", "normal"):
        attack_type = AttackType.NONE
    else:
        attack_type = AttackType(scenario_str)

    print(f"\n=======================================================")
    print(f"       MODULE 2 THREAT DETECTION ENGINE DEMO          ")
    print(f"=======================================================")
    print(f" Running Scenario: {attack_type.value.upper()} (Key Length: {args.key_length})")
    print(f"-------------------------------------------------------\n")

    request_obj = generate_mock_dataset(
        scenario=attack_type,
        key_length=args.key_length,
        baseline_qber=0.02,
        attack_fraction=0.25 if attack_type == AttackType.MITM else 0.0,
        seed=42,
    )

    report = analyze_security_transaction(request_obj)

    print(f" SESSION ID      : {report.session_id}")
    print(f" BLOCK ID        : {report.block_id}")
    print(f" STATUS          : {report.status}")
    print(f" EXECUTION TIME  : {report.telemetry.execution_time_ms} ms")
    print(f" TOTAL BITS      : {report.sifting.total_bits}")
    print(f" SIFTED BITS     : {report.sifting.matching_bits}")
    print(f" SIFTING RATIO   : {report.sifting.sifting_ratio}")
    print(f" MISMATCHES      : {report.error_analysis.mismatch_count}")
    print(f" OBSERVED QBER   : {report.qber_analysis.qber} ({report.qber_analysis.qber_percentage}%)")
    print(f" THRESHOLD T     : {report.threshold_analysis.threshold} (Delta: {report.threshold_analysis.delta})")
    print(f" CHSH SCORE S    : {report.chsh_analysis.score} ({report.chsh_analysis.status.value})")
    print(f" CLASSIFICATION  : {report.diagnostics.classification.value}")
    print(f" REASON CODES    : {[r.value for r in report.decision.reason_codes]}")
    print(f" AUTHENTICATED   : {report.decision.authenticated}")
    print(f" DECISION GATE   : >>> {report.decision.decision.value} <<<\n")


if __name__ == "__main__":
    main()
