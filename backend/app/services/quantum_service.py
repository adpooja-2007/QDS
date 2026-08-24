"""
Quantum simulation service (stub implementation).

Provides realistic simulated behavior for EPR generation, Alice's signing,
Bob's verification, and basis sifting. Uses NumPy random sampling to produce
statistically realistic outputs.

When Module 1 (Qiskit Quantum Core) is ready, replace the internal
simulation logic while keeping the same function signatures.
"""

import hashlib
import logging
import random
from typing import List, Tuple

import numpy as np

from app.services.session_service import session_service
from app.schemas.session import AliceData, BobData, SiftingData
from app.core.exceptions import InvalidSessionStateError

logger = logging.getLogger("qds.quantum")

# Bell measurement outcome labels
BELL_OUTCOMES = ["00", "01", "10", "11"]

# Pauli correction lookup (Bell bits → correction gate)
CORRECTION_MAP = {
    "00": "I",
    "01": "X",
    "10": "Z",
    "11": "XZ",
}

# Basis labels
BASES = ["Z", "X"]


class QuantumService:
    """
    Stub quantum simulation service.

    Each method simulates the corresponding quantum operation using
    classical random sampling, producing outputs that match the
    expected statistical distributions.
    """

    def generate_epr(self, session_id: str, num_pairs: int) -> dict:
        """
        Simulate EPR pair generation and distribution.

        In the real implementation (Module 1), this would:
        - Create num_pairs Bell states |Φ+⟩ using Qiskit
        - Route qubit 1 → Alice, qubit 2 → Bob

        Stub: Creates the session state and marks it EPR_READY.
        """
        session = session_service.get(session_id)

        session_service.update_status(session_id, "EPR_READY")
        logger.info("EPR pairs generated: %d for session %s", num_pairs, session_id)

        return {
            "session_id": session_id,
            "num_pairs": num_pairs,
            "status": "EPR_READY",
        }

    def prepare_and_sign(
        self, session_id: str, document_hash: str
    ) -> dict:
        """
        Simulate Alice's complete signing operation:
        1. Convert document hash → binary key bits
        2. Generate random preparation bases (Z/X)
        3. Prepare quantum signature states
        4. Perform Joint Bell Measurement
        5. Extract classical feed-forward bits

        In the real implementation (Module 1), this would use Qiskit circuits
        for state preparation, CNOT, Hadamard, and measurement.

        Stub: Uses the hash to seed deterministic random generation,
        then samples Bell measurement outcomes uniformly.
        """
        session = session_service.get(session_id)

        if session.status not in ("EPR_READY", "SIGNED"):
            raise InvalidSessionStateError(
                session_id, session.status, "EPR_READY"
            )

        num_pairs = session.parameters.num_pairs

        # Derive Alice's bits from the document hash
        hash_seed = int(hashlib.sha256(document_hash.encode()).hexdigest()[:8], 16)
        rng = np.random.RandomState(hash_seed)
        alice_bits = rng.randint(0, 2, size=num_pairs).tolist()

        # Random preparation bases
        alice_bases = [random.choice(BASES) for _ in range(num_pairs)]

        # Simulate Bell measurement outcomes (uniformly distributed in ideal case)
        bell_bits = [random.choice(BELL_OUTCOMES) for _ in range(num_pairs)]

        # Generate signature ID
        sig_id = f"SIG-{session_id.split('-')[-1]}"

        # Store in session
        alice_data = AliceData(
            document_hash=document_hash,
            bits=alice_bits,
            bases=alice_bases,
            bell_measurements=bell_bits,
        )

        session_service.update(session_id, alice=alice_data, status="SIGNED")

        logger.info(
            "Alice signed: session=%s, hash=%s..., pairs=%d",
            session_id, document_hash[:16], num_pairs,
        )

        return {
            "session_id": session_id,
            "signature_id": sig_id,
            "bell_bits": bell_bits,
            "alice_bases": alice_bases,
            "num_pairs": num_pairs,
            "status": "SIGNED",
        }

    def verify(self, session_id: str) -> dict:
        """
        Simulate Bob's complete verification operation:
        1. Receive Alice's classical feed-forward bits
        2. Apply Pauli correction based on Bell measurement results
        3. Choose random measurement bases
        4. Measure reconstructed qubits

        In the real implementation (Module 1), this would apply Qiskit
        Pauli gates (I/X/Z/XZ) and run projective measurements.

        Stub: In an ideal channel (no attack), Bob's measurement matches
        Alice's bit when their bases match. We simulate this with
        controlled random errors based on baseline noise.
        """
        session = session_service.get(session_id)

        if session.status not in ("SIGNED", "MEASURED"):
            raise InvalidSessionStateError(
                session_id, session.status, "SIGNED"
            )

        num_pairs = session.parameters.num_pairs
        baseline_noise = session.parameters.baseline_noise
        alice_bits = session.alice.bits
        alice_bases = session.alice.bases
        bell_bits = session.alice.bell_measurements

        # Determine Pauli corrections
        corrections = [CORRECTION_MAP[bb] for bb in bell_bits]

        # Bob's random measurement bases
        bob_bases = [random.choice(BASES) for _ in range(num_pairs)]

        # Simulate Bob's measurements
        # In ideal case: if bases match, Bob gets Alice's bit (with noise)
        # If bases don't match, result is random
        bob_measurements = []
        for i in range(num_pairs):
            if bob_bases[i] == alice_bases[i]:
                # Matching basis: should agree (with small noise probability)
                if random.random() < baseline_noise:
                    bob_measurements.append(1 - alice_bits[i])  # Error
                else:
                    bob_measurements.append(alice_bits[i])       # Correct
            else:
                # Mismatched basis: random outcome
                bob_measurements.append(random.randint(0, 1))

        # Store in session
        bob_data = BobData(
            bases=bob_bases,
            measurements=bob_measurements,
            corrections=corrections,
        )

        session_service.update(session_id, bob=bob_data, status="MEASURED")

        logger.info(
            "Bob verified: session=%s, measured=%d qubits",
            session_id, num_pairs,
        )

        return {
            "session_id": session_id,
            "bob_bases": bob_bases,
            "bob_measurements": bob_measurements,
            "corrections_applied": corrections,
            "num_measured": num_pairs,
            "status": "MEASURED",
        }

    def sift(self, session_id: str) -> dict:
        """
        Perform basis sifting / reconciliation.

        Compare Alice's and Bob's measurement bases.
        Keep only indices where they match.
        Produce sifted key arrays for security analysis.
        """
        session = session_service.get(session_id)

        if session.status not in ("MEASURED", "SIFTED"):
            raise InvalidSessionStateError(
                session_id, session.status, "MEASURED"
            )

        alice_bases = session.alice.bases
        bob_bases = session.bob.bases
        alice_bits = session.alice.bits
        bob_measurements = session.bob.measurements
        num_pairs = len(alice_bases)

        # Find matching indices
        matched_indices = []
        sifted_alice = []
        sifted_bob = []

        for i in range(num_pairs):
            if alice_bases[i] == bob_bases[i]:
                matched_indices.append(i)
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measurements[i])

        sifted_length = len(matched_indices)
        discard_rate = 1.0 - (sifted_length / num_pairs) if num_pairs > 0 else 0.0

        # Store sifting results
        sifting_data = SiftingData(
            matched_indices=matched_indices,
            alice_bits=sifted_alice,
            bob_bits=sifted_bob,
            sifted_length=sifted_length,
        )

        session_service.update(session_id, sifting=sifting_data, status="SIFTED")

        logger.info(
            "Basis sifting: session=%s, kept=%d/%d (discard=%.1f%%)",
            session_id, sifted_length, num_pairs, discard_rate * 100,
        )

        return {
            "session_id": session_id,
            "matched_indices": matched_indices,
            "sifted_alice_bits": sifted_alice,
            "sifted_bob_bits": sifted_bob,
            "sifted_length": sifted_length,
            "discard_rate": round(discard_rate, 4),
            "status": "SIFTED",
        }


# ── Singleton instance ────────────────────────────────────────────────
quantum_service = QuantumService()
