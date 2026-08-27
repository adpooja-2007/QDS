"""
Attack simulation service (stub implementation).

Provides realistic attack injection for:
- Intercept-Resend (MitM)
- Signature Forgery
- Replay Attack
- Physical Channel Noise
- Photon-Number-Splitting (PNS)

Each attack modifies the actual session data (Bob's measurements,
Alice's feed-forward bits, etc.) rather than just setting a flag.
This ensures the security audit produces authentic detection results.

When Module 4 (Attack Engine) is ready, replace the internal
simulation logic while keeping the same function signatures.
"""

import uuid
import random
import logging
from datetime import datetime, timezone
from typing import List

import numpy as np

from app.services.session_service import session_service
from app.schemas.session import AttackRecord, BobData
from app.core.exceptions import (
    InvalidSessionStateError,
    ReplayDetectedError,
    InsufficientDataError,
)

logger = logging.getLogger("qds.attacks")


class AttackService:
    """
    Red-team attack simulation service.

    Each attack method modifies the actual quantum/classical data
    in the session so that the security audit produces real
    (not fake) detection results.
    """

    def _generate_attack_id(self) -> str:
        """Generate a unique attack ID."""
        return f"ATT-{uuid.uuid4().hex[:8].upper()}"

    def intercept_resend(
        self,
        session_id: str,
        attack_fraction: float = 0.25,
        basis_strategy: str = "RANDOM",
    ) -> dict:
        """
        Simulate an intercept-resend (Man-in-the-Middle) attack.

        Eve intercepts a fraction of qubits, measures them in her
        chosen basis, and resends the post-measurement state to Bob.
        When Eve chooses the wrong basis (50% of the time for RANDOM),
        she introduces disturbance in Bob's measurements.

        This modifies Bob's measurement data in the session.
        """
        session = session_service.get(session_id)

        if session.status not in ("MEASURED", "SIFTED", "AUDITED"):
            raise InvalidSessionStateError(
                session_id, session.status, "MEASURED, SIFTED, or AUDITED"
            )


        alice_bits = session.alice.bits
        alice_bases = session.alice.bases
        bob_measurements = list(session.bob.measurements)
        bob_bases = session.bob.bases
        num_pairs = len(alice_bits)

        # Select which qubits Eve intercepts
        num_affected = int(num_pairs * attack_fraction)
        affected_indices = sorted(random.sample(range(num_pairs), min(num_affected, num_pairs)))

        errors_introduced = 0

        for i in affected_indices:
            # Eve chooses a measurement basis
            if basis_strategy == "Z_ONLY":
                eve_basis = "Z"
            elif basis_strategy == "X_ONLY":
                eve_basis = "X"
            else:  # RANDOM
                eve_basis = random.choice(["Z", "X"])

            # If Eve's basis doesn't match Alice's basis:
            # Eve collapses the state into her basis. When Bob measures in Alice's basis,
            # Bob gets a 50/50 chance of measuring 0 or 1.
            if eve_basis != alice_bases[i]:
                # Bit flip occurs 50% of the time when Eve guessed wrong basis
                if random.random() < 0.5:
                    bob_measurements[i] = 1 - alice_bits[i]
                    errors_introduced += 1
            else:
                # Eve guessed right basis (no disturbance introduced)
                pass


        # Update Bob's measurements in the session
        bob_data = BobData(
            bases=bob_bases,
            measurements=bob_measurements,
            corrections=session.bob.corrections,
        )

        # Re-sift with modified measurements
        from app.schemas.session import SiftingData
        matched_indices = []
        sifted_alice = []
        sifted_bob = []
        for i in range(num_pairs):
            if alice_bases[i] == bob_bases[i]:
                matched_indices.append(i)
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measurements[i])

        sifting_data = SiftingData(
            matched_indices=matched_indices,
            alice_bits=sifted_alice,
            bob_bits=sifted_bob,
            sifted_length=len(matched_indices),
        )

        # Record the attack
        attack_id = self._generate_attack_id()
        attack_record = AttackRecord(
            attack_id=attack_id,
            attack_type="INTERCEPT_RESEND",
            attack_fraction=attack_fraction,
            affected_count=num_affected,
            timestamp=datetime.now(timezone.utc),
            details={
                "basis_strategy": basis_strategy,
                "errors_introduced": errors_introduced,
            },
        )

        session_service.update(
            session_id,
            bob=bob_data,
            sifting=sifting_data,
            status="SIFTED",
        )
        session_service.add_attack(session_id, attack_record)

        # Auto-run security audit so database reflects real-time QBER & REJECT verdict immediately
        try:
            from app.services.security_service import security_service
            security_service.run_audit(session_id)
        except Exception as e:
            logger.debug("Auto-audit note: %s", e)

        logger.warning(
            "INTERCEPT-RESEND: session=%s, fraction=%.2f, affected=%d, errors=%d",
            session_id, attack_fraction, num_affected, errors_introduced,
        )


        return {
            "attack_id": attack_id,
            "attack_type": "INTERCEPT_RESEND",
            "session_id": session_id,
            "affected_count": num_affected,
            "total_count": num_pairs,
            "attack_fraction": attack_fraction,
            "status": "INJECTED",
            "details": {
                "basis_strategy": basis_strategy,
                "errors_introduced": errors_introduced,
            },
        }

    def forge(self, session_id: str, attack_fraction: float = 0.10) -> dict:
        """
        Simulate a classical signature forgery attack.

        Eve modifies the classical feed-forward bits (b1,b2) in transit.
        This forces Bob to apply incorrect Pauli corrections, causing
        measurement mismatches and driving up the QBER.
        """
        session = session_service.get(session_id)

        if session.status not in ("SIGNED", "MEASURED", "SIFTED", "AUDITED"):
            raise InvalidSessionStateError(
                session_id, session.status, "SIGNED, MEASURED, SIFTED, or AUDITED"
            )


        bell_bits = list(session.alice.bell_measurements)
        alice_bits = session.alice.bits
        alice_bases = session.alice.bases
        num_pairs = len(bell_bits)

        # Select which classical bits Eve modifies
        num_affected = int(num_pairs * attack_fraction)
        affected_indices = sorted(random.sample(range(num_pairs), min(num_affected, num_pairs)))

        # Eve flips classical bits
        possible_outcomes = ["00", "01", "10", "11"]
        for i in affected_indices:
            original = bell_bits[i]
            # Choose a different Bell outcome
            alternatives = [b for b in possible_outcomes if b != original]
            bell_bits[i] = random.choice(alternatives)

        # Use existing Bob bases if already measured, else generate random ones
        bob_bases = session.bob.bases if session.bob.bases else [random.choice(["Z", "X"]) for _ in range(num_pairs)]
        bob_measurements = []

        CORRECTION_MAP = {"00": "I", "01": "X", "10": "Z", "11": "XZ"}
        corrections = [CORRECTION_MAP[bb] for bb in bell_bits]


        baseline_noise = session.parameters.baseline_noise
        for i in range(num_pairs):
            if i in affected_indices:
                # Wrong correction → random result
                bob_measurements.append(random.randint(0, 1))
            else:
                # Correct correction
                if bob_bases[i] == alice_bases[i]:
                    if random.random() < baseline_noise:
                        bob_measurements.append(1 - alice_bits[i])
                    else:
                        bob_measurements.append(alice_bits[i])
                else:
                    bob_measurements.append(random.randint(0, 1))

        # Update session
        bob_data = BobData(
            bases=bob_bases,
            measurements=bob_measurements,
            corrections=corrections,
        )

        # Re-sift
        from app.schemas.session import SiftingData, AliceData
        matched_indices = []
        sifted_alice = []
        sifted_bob = []
        for i in range(num_pairs):
            if alice_bases[i] == bob_bases[i]:
                matched_indices.append(i)
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measurements[i])

        sifting_data = SiftingData(
            matched_indices=matched_indices,
            alice_bits=sifted_alice,
            bob_bits=sifted_bob,
            sifted_length=len(matched_indices),
        )

        # Update Alice's bell measurements (forged version)
        alice_data = AliceData(
            document_hash=session.alice.document_hash,
            bits=alice_bits,
            bases=alice_bases,
            bell_measurements=bell_bits,
        )

        attack_id = self._generate_attack_id()
        attack_record = AttackRecord(
            attack_id=attack_id,
            attack_type="FORGERY",
            attack_fraction=attack_fraction,
            affected_count=num_affected,
            timestamp=datetime.now(timezone.utc),
            details={"bits_modified": num_affected},
        )

        session_service.update(
            session_id,
            alice=alice_data,
            bob=bob_data,
            sifting=sifting_data,
            status="SIFTED",
        )
        session_service.add_attack(session_id, attack_record)

        # Auto-run security audit so database reflects real-time QBER & REJECT verdict immediately
        try:
            from app.services.security_service import security_service
            security_service.run_audit(session_id)
        except Exception as e:
            logger.debug("Auto-audit note: %s", e)

        logger.warning(
            "FORGERY: session=%s, fraction=%.2f, bits_modified=%d",
            session_id, attack_fraction, num_affected,
        )


        return {
            "attack_id": attack_id,
            "attack_type": "FORGERY",
            "session_id": session_id,
            "affected_count": num_affected,
            "total_count": num_pairs,
            "attack_fraction": attack_fraction,
            "status": "INJECTED",
            "details": {"bits_modified": num_affected},
        }

    def replay(self, session_id: str, replay_session_id: str) -> dict:
        """
        Attempt a replay attack.

        Eve tries to use feed-forward data from a previous session
        in a new session. The system detects this via session binding
        (nonce mismatch) and rejects the attempt.
        """
        attack_id = self._generate_attack_id()

        # Check if target session exists
        current_session = session_service.get(session_id)

        # Check if replay source exists
        if not session_service.exists(replay_session_id):
            return {
                "attack_id": attack_id,
                "attack_type": "REPLAY",
                "session_id": session_id,
                "replay_session_id": replay_session_id,
                "detected": True,
                "reason": "REPLAY_SOURCE_NOT_FOUND",
                "status": "BLOCKED",
            }

        replay_source = session_service.get(replay_session_id)

        # Session binding check: nonces must match
        if current_session.nonce != replay_source.nonce:
            # Record the attack attempt
            attack_record = AttackRecord(
                attack_id=attack_id,
                attack_type="REPLAY",
                attack_fraction=1.0,
                affected_count=0,
                timestamp=datetime.now(timezone.utc),
                details={
                    "replay_session_id": replay_session_id,
                    "reason": "SESSION_NONCE_MISMATCH",
                },
            )
            session_service.add_attack(session_id, attack_record)

            logger.warning(
                "REPLAY DETECTED: session=%s, replay_source=%s, nonce_mismatch",
                session_id, replay_session_id,
            )

            return {
                "attack_id": attack_id,
                "attack_type": "REPLAY",
                "session_id": session_id,
                "replay_session_id": replay_session_id,
                "detected": True,
                "reason": "SESSION_NONCE_MISMATCH",
                "status": "BLOCKED",
            }

        # Same session ID replayed — also blocked
        return {
            "attack_id": attack_id,
            "attack_type": "REPLAY",
            "session_id": session_id,
            "replay_session_id": replay_session_id,
            "detected": True,
            "reason": "SESSION_ALREADY_USED",
            "status": "BLOCKED",
        }

    def inject_noise(
        self,
        session_id: str,
        noise_model: str = "DEPOLARIZING",
        probability: float = 0.02,
    ) -> dict:
        """
        Inject physical channel noise into Bob's measurements.

        Simulates environmental effects like thermal noise, phase drift,
        or depolarization. The noise is applied probabilistically to
        individual measurement outcomes.
        """
        session = session_service.get(session_id)

        if session.status not in ("MEASURED", "SIFTED", "AUDITED"):
            raise InvalidSessionStateError(
                session_id, session.status, "MEASURED, SIFTED, or AUDITED"
            )


        alice_bits = session.alice.bits
        alice_bases = session.alice.bases
        bob_measurements = list(session.bob.measurements)
        bob_bases = session.bob.bases
        num_pairs = len(bob_measurements)

        affected_count = 0

        for i in range(num_pairs):
            if random.random() < probability:
                if noise_model == "BIT_FLIP":
                    bob_measurements[i] = 1 - bob_measurements[i]
                    affected_count += 1
                elif noise_model == "PHASE_FLIP":
                    # Phase flip only affects X-basis measurements
                    if bob_bases[i] == "X":
                        bob_measurements[i] = 1 - bob_measurements[i]
                        affected_count += 1
                elif noise_model == "AMPLITUDE_DAMPING":
                    # Bias towards |0⟩
                    if bob_measurements[i] == 1 and random.random() < 0.5:
                        bob_measurements[i] = 0
                        affected_count += 1
                else:  # DEPOLARIZING
                    bob_measurements[i] = random.randint(0, 1)
                    affected_count += 1

        # Update session
        bob_data = BobData(
            bases=bob_bases,
            measurements=bob_measurements,
            corrections=session.bob.corrections,
        )

        # Re-sift
        from app.schemas.session import SiftingData
        matched_indices = []
        sifted_alice = []
        sifted_bob = []
        for i in range(num_pairs):
            if alice_bases[i] == bob_bases[i]:
                matched_indices.append(i)
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measurements[i])

        sifting_data = SiftingData(
            matched_indices=matched_indices,
            alice_bits=sifted_alice,
            bob_bits=sifted_bob,
            sifted_length=len(matched_indices),
        )

        attack_id = self._generate_attack_id()
        attack_record = AttackRecord(
            attack_id=attack_id,
            attack_type="NOISE",
            attack_fraction=probability,
            affected_count=affected_count,
            timestamp=datetime.now(timezone.utc),
            details={
                "noise_model": noise_model,
                "probability": probability,
            },
        )

        session_service.update(
            session_id,
            bob=bob_data,
            sifting=sifting_data,
            status="SIFTED",
        )
        session_service.add_attack(session_id, attack_record)

        # Auto-run security audit so database reflects real-time QBER & REJECT verdict immediately
        try:
            from app.services.security_service import security_service
            security_service.run_audit(session_id)
        except Exception as e:
            logger.debug("Auto-audit note: %s", e)

        logger.info(
            "NOISE INJECTED: session=%s, model=%s, p=%.4f, affected=%d",
            session_id, noise_model, probability, affected_count,
        )


        return {
            "attack_id": attack_id,
            "attack_type": "NOISE",
            "session_id": session_id,
            "affected_count": affected_count,
            "total_count": num_pairs,
            "attack_fraction": probability,
            "status": "INJECTED",
            "details": {
                "noise_model": noise_model,
                "probability": probability,
            },
        }

    def pns(self, session_id: str, intensity: float = 0.20) -> dict:
        """
        Simulate a Photon-Number-Splitting (PNS) attack.

        Eve exploits multi-photon pulses by splitting off one photon,
        storing it, and sending the remainder to Bob. This is modeled
        as a selective information leakage that can be detected by
        analyzing decoy-state statistics.

        Stub: Simulates the effect by introducing correlated errors
        in a fraction of measurements proportional to intensity.
        """
        session = session_service.get(session_id)

        if session.status not in ("MEASURED", "SIFTED", "AUDITED"):
            raise InvalidSessionStateError(
                session_id, session.status, "MEASURED, SIFTED, or AUDITED"
            )


        alice_bits = session.alice.bits
        alice_bases = session.alice.bases
        bob_measurements = list(session.bob.measurements)
        bob_bases = session.bob.bases
        num_pairs = len(bob_measurements)

        # PNS affects multi-photon pulses (simulated probabilistically)
        # Eve can extract information without disturbing single-photon pulses
        # But multi-photon fraction is proportional to intensity
        multi_photon_fraction = intensity * 0.3  # Poisson probability estimate
        num_affected = int(num_pairs * multi_photon_fraction)
        affected_indices = sorted(random.sample(range(num_pairs), min(num_affected, num_pairs)))

        for i in affected_indices:
            # Eve gains partial information — introduces subtle errors
            if random.random() < 0.3:  # Eve's measurement isn't perfect
                bob_measurements[i] = random.randint(0, 1)

        # Update session
        bob_data = BobData(
            bases=bob_bases,
            measurements=bob_measurements,
            corrections=session.bob.corrections,
        )

        # Re-sift
        from app.schemas.session import SiftingData
        matched_indices = []
        sifted_alice = []
        sifted_bob = []
        for i in range(num_pairs):
            if alice_bases[i] == bob_bases[i]:
                matched_indices.append(i)
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measurements[i])

        sifting_data = SiftingData(
            matched_indices=matched_indices,
            alice_bits=sifted_alice,
            bob_bits=sifted_bob,
            sifted_length=len(matched_indices),
        )

        attack_id = self._generate_attack_id()
        attack_record = AttackRecord(
            attack_id=attack_id,
            attack_type="PNS",
            attack_fraction=intensity,
            affected_count=num_affected,
            timestamp=datetime.now(timezone.utc),
            details={
                "intensity": intensity,
                "multi_photon_fraction": multi_photon_fraction,
            },
        )

        session_service.update(
            session_id,
            bob=bob_data,
            sifting=sifting_data,
            status="SIFTED",
        )
        session_service.add_attack(session_id, attack_record)

        # Auto-run security audit so database reflects real-time QBER & REJECT verdict immediately
        try:
            from app.services.security_service import security_service
            security_service.run_audit(session_id)
        except Exception as e:
            logger.debug("Auto-audit note: %s", e)

        logger.warning(
            "PNS ATTACK: session=%s, intensity=%.2f, affected=%d",
            session_id, intensity, num_affected,
        )


        return {
            "attack_id": attack_id,
            "attack_type": "PNS",
            "session_id": session_id,
            "affected_count": num_affected,
            "total_count": num_pairs,
            "attack_fraction": intensity,
            "status": "INJECTED",
            "details": {
                "intensity": intensity,
                "multi_photon_fraction": round(multi_photon_fraction, 4),
            },
        }


# ── Singleton instance ────────────────────────────────────────────────
attack_service = AttackService()
