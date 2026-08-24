"""
Security / threat-detection service (stub implementation).

Provides deterministic, non-AI statistical security analysis:
- XOR bit-wise match evaluation
- QBER (Quantum Bit Error Rate) calculation
- Hoeffding-Chernoff statistical threshold
- CHSH Bell inequality test
- Deterministic decision gate

When Module 2 (Threat Detection Engine) is ready, replace the
internal logic while keeping the same function signatures.
"""

import math
import logging
from typing import List, Tuple, Optional

import numpy as np

from app.services.session_service import session_service
from app.schemas.session import SecurityResult
from app.core.exceptions import InvalidSessionStateError, InsufficientDataError
from app.core.config import settings

logger = logging.getLogger("qds.security")


class SecurityService:
    """
    Deterministic statistical security analysis service.

    All calculations are mathematical — zero AI/ML dependencies.
    This makes the security decisions explainable and auditable.
    """

    def calculate_xor(
        self, alice_bits: List[int], bob_bits: List[int]
    ) -> Tuple[List[int], int]:
        """
        Compute bit-wise XOR mismatch array.

        M[i] = Alice[i] ⊕ Bob[i]
        0 = match, 1 = mismatch

        Returns:
            (mismatch_array, error_count)
        """
        if len(alice_bits) != len(bob_bits):
            raise ValueError(
                f"Bit array length mismatch: Alice={len(alice_bits)}, Bob={len(bob_bits)}"
            )

        a = np.array(alice_bits, dtype=np.int8)
        b = np.array(bob_bits, dtype=np.int8)
        mismatches = np.bitwise_xor(a, b)
        error_count = int(np.sum(mismatches))

        return mismatches.tolist(), error_count

    def calculate_qber(
        self, alice_bits: List[int], bob_bits: List[int]
    ) -> dict:
        """
        Calculate the Quantum Bit Error Rate.

        QBER = errors / total_sifted_bits

        Returns:
            Dict with error_count, total_bits, qber, qber_percentage.
        """
        _, error_count = self.calculate_xor(alice_bits, bob_bits)
        total_bits = len(alice_bits)

        if total_bits == 0:
            raise InsufficientDataError("QBER", "At least 1 sifted bit")

        qber = error_count / total_bits

        return {
            "error_count": error_count,
            "total_bits": total_bits,
            "qber": round(qber, 6),
            "qber_percentage": round(qber * 100, 4),
        }

    def calculate_threshold(
        self,
        sample_size: int,
        baseline_qber: float = 0.02,
        alpha: float = 1e-6,
    ) -> dict:
        """
        Calculate the Hoeffding statistical threshold.

        Uses the corrected Hoeffding bound:
            Δ = sqrt(ln(2/α) / (2N))
            T = e0 + Δ

        This provides a statistically defensible boundary that
        distinguishes natural noise from attack-induced disturbance.

        Args:
            sample_size: Number of sifted samples (N).
            baseline_qber: Expected baseline noise (e0).
            alpha: Target false-alarm probability (α).

        Returns:
            Dict with delta and threshold.
        """
        if sample_size <= 0:
            raise InsufficientDataError("Threshold", "sample_size > 0")

        delta = math.sqrt(math.log(2.0 / alpha) / (2.0 * sample_size))
        threshold = baseline_qber + delta

        logger.info(
            "Hoeffding threshold: N=%d, e0=%.4f, α=%.1e → Δ=%.6f, T=%.6f",
            sample_size, baseline_qber, alpha, delta, threshold,
        )

        return {
            "sample_size": sample_size,
            "baseline_qber": baseline_qber,
            "alpha": alpha,
            "delta": round(delta, 6),
            "threshold": round(threshold, 6),
        }

    def calculate_chsh(self, correlations: dict) -> dict:
        """
        Calculate the CHSH Bell inequality S-value.

        S = E(a,b) - E(a,b') + E(a',b) + E(a',b')

        Classical bound: S ≤ 2
        Quantum ideal:   S = 2√2 ≈ 2.828

        Args:
            correlations: Dict with E_ab, E_ab_prime, E_a_prime_b, E_a_prime_b_prime.

        Returns:
            Dict with S value and entanglement status.
        """
        e_ab = correlations["E_ab"]
        e_ab_prime = correlations["E_ab_prime"]
        e_a_prime_b = correlations["E_a_prime_b"]
        e_a_prime_b_prime = correlations["E_a_prime_b_prime"]

        S = abs(e_ab - e_ab_prime + e_a_prime_b + e_a_prime_b_prime)

        if S >= 2.4:
            status = "ENTANGLEMENT_PRESENT"
        elif S >= 2.0:
            status = "CORRELATION_DEGRADED"
        else:
            status = "BELL_VIOLATION_FAILED"

        logger.info("CHSH test: S=%.4f → %s", S, status)

        return {
            "S": round(S, 4),
            "classical_bound": 2.0,
            "quantum_ideal": round(2 * math.sqrt(2), 4),
            "status": status,
        }

    def _simulate_chsh_for_session(self, session_id: str) -> dict:
        """
        Simulate CHSH correlations for a session.

        In the real implementation (Module 2), this would compute
        actual correlation coefficients from entangled measurement data.

        Stub: Generates realistic CHSH values based on whether
        attacks are present in the session.
        """
        session = session_service.get(session_id)
        has_attacks = len(session.attacks) > 0

        if has_attacks:
            # Attacks degrade CHSH — simulate correlation loss
            max_fraction = max(
                (a.attack_fraction for a in session.attacks), default=0.0
            )
            # Degraded S proportional to attack intensity
            base_s = 2.82
            degradation = max_fraction * 1.2  # Strong degradation
            S = max(1.5, base_s - degradation + np.random.normal(0, 0.05))
        else:
            # Clean channel — near-ideal quantum correlations
            S = 2.7 + np.random.uniform(0.0, 0.12)

        # Construct correlations that produce this S value
        # Using symmetric basis choices for simplicity
        quarter_s = S / 4.0
        correlations = {
            "E_ab": round(quarter_s + np.random.normal(0, 0.02), 4),
            "E_ab_prime": round(-quarter_s + np.random.normal(0, 0.02), 4),
            "E_a_prime_b": round(quarter_s + np.random.normal(0, 0.02), 4),
            "E_a_prime_b_prime": round(quarter_s + np.random.normal(0, 0.02), 4),
        }

        return self.calculate_chsh(correlations)

    def run_audit(self, session_id: str) -> dict:
        """
        Run a complete security audit on a session.

        Pipeline:
            Sifted data → XOR → QBER → Threshold → CHSH → Decision

        This is the most important endpoint in the system.
        The dashboard primarily consumes this response.
        """
        session = session_service.get(session_id)

        if session.status not in ("SIFTED", "AUDITED"):
            raise InvalidSessionStateError(
                session_id, session.status, "SIFTED"
            )

        alice_bits = session.sifting.alice_bits
        bob_bits = session.sifting.bob_bits
        sifted_length = session.sifting.sifted_length

        if sifted_length == 0:
            raise InsufficientDataError("Security Audit", "Sifted bits > 0")

        # Step 1: QBER calculation
        qber_result = self.calculate_qber(alice_bits, bob_bits)

        # Step 2: Hoeffding threshold
        threshold_result = self.calculate_threshold(
            sample_size=sifted_length,
            baseline_qber=session.parameters.baseline_noise,
            alpha=session.parameters.alpha,
        )

        # Step 3: CHSH Bell test
        chsh_result = self._simulate_chsh_for_session(session_id)

        # Step 4: Deterministic decision gate
        qber_pass = qber_result["qber"] <= threshold_result["threshold"]
        chsh_pass = chsh_result["S"] >= settings.DEFAULT_CHSH_MINIMUM
        session_valid = True  # Already validated by state check

        overall = "ACCEPT" if (qber_pass and chsh_pass and session_valid) else "REJECT"

        # Determine threat information
        threat_detected = overall == "REJECT"
        threat_type = None
        threat_severity = None
        threat_desc = None

        if threat_detected:
            if session.attacks:
                threat_type = session.attacks[-1].attack_type
            elif not qber_pass:
                threat_type = "QBER_THRESHOLD_EXCEEDED"
            elif not chsh_pass:
                threat_type = "BELL_CORRELATION_LOST"

            if qber_result["qber"] > 0.15:
                threat_severity = "CRITICAL"
            elif qber_result["qber"] > 0.05:
                threat_severity = "HIGH"
            else:
                threat_severity = "MEDIUM"

            threat_desc = (
                f"Observed QBER ({qber_result['qber_percentage']:.2f}%) "
                f"{'exceeds' if not qber_pass else 'within'} threshold "
                f"({threshold_result['threshold'] * 100:.2f}%). "
                f"CHSH S={chsh_result['S']:.4f} "
                f"{'fails' if not chsh_pass else 'passes'} Bell test."
            )

        # Store security results in session
        security_result = SecurityResult(
            error_count=qber_result["error_count"],
            sifted_bits=sifted_length,
            qber=qber_result["qber"],
            threshold=threshold_result["threshold"],
            hoeffding_delta=threshold_result["delta"],
            chsh=chsh_result["S"],
            chsh_status=chsh_result["status"],
            qber_pass=qber_pass,
            chsh_pass=chsh_pass,
            decision=overall,
            threat_detected=threat_detected,
            threat_type=threat_type,
        )

        session_service.update(
            session_id, security=security_result, status="AUDITED"
        )

        logger.info(
            "Security audit: session=%s, QBER=%.4f, T=%.4f, CHSH=%.4f → %s",
            session_id, qber_result["qber"], threshold_result["threshold"],
            chsh_result["S"], overall,
        )

        return {
            "session_id": session_id,
            "metrics": {
                "sifted_bits": sifted_length,
                "error_count": qber_result["error_count"],
                "qber": qber_result["qber"],
                "qber_percentage": qber_result["qber_percentage"],
                "baseline_noise": session.parameters.baseline_noise,
                "hoeffding_delta": threshold_result["delta"],
                "threshold": threshold_result["threshold"],
                "threshold_percentage": round(threshold_result["threshold"] * 100, 4),
                "chsh": chsh_result["S"],
                "chsh_status": chsh_result["status"],
            },
            "decision": {
                "qber_pass": qber_pass,
                "chsh_pass": chsh_pass,
                "session_valid": session_valid,
                "overall": overall,
            },
            "threat": {
                "detected": threat_detected,
                "type": threat_type,
                "severity": threat_severity,
                "description": threat_desc,
            },
        }


# ── Singleton instance ────────────────────────────────────────────────
security_service = SecurityService()
