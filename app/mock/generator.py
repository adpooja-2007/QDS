"""
Mock Data Generator (Feature M2-F20).
Generates realistic, stochastic, reproducible quantum measurement datasets for testing.
"""

from typing import Sequence
import numpy as np
from app.models.enums import AttackType
from app.models.input_models import (
    SecurityAnalysisRequest,
    QuantumMeasurementData,
    ChannelParameters,
    SecurityParameters,
    CHSHData,
    DecoyStateData,
    SingleStateCount,
)


def generate_mock_dataset(
    scenario: AttackType = AttackType.NONE,
    key_length: int = 1000,
    baseline_qber: float = 0.02,
    attack_fraction: float = 0.0,
    seed: int | None = 42,
) -> SecurityAnalysisRequest:
    """
    Generates a deterministic or stochastic SecurityAnalysisRequest for a specified scenario.
    """
    rng = np.random.default_rng(seed)

    # Generate Alice's random bits and bases
    alice_bits = rng.integers(0, 2, size=key_length).tolist()
    alice_bases = rng.choice(["Z", "X"], size=key_length).tolist()

    bob_bases: list[str]
    bob_bits: list[int]
    chsh_score: float = 2.72
    decoy_data: DecoyStateData | None = None

    if scenario == AttackType.NONE:
        # Legitimate channel: Bob chooses random bases, normal physical noise e_0
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()
        bob_bits = list(alice_bits)
        # Flip bits with probability equal to baseline_qber
        noise_flips = rng.random(size=key_length) < baseline_qber
        for i in range(key_length):
            if noise_flips[i]:
                bob_bits[i] ^= 1
        chsh_score = 2.72

    elif scenario == AttackType.NOISE:
        # Mildly elevated physical channel noise
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()
        bob_bits = list(alice_bits)
        noise_rate = max(baseline_qber, 0.05)
        noise_flips = rng.random(size=key_length) < noise_rate
        for i in range(key_length):
            if noise_flips[i]:
                bob_bits[i] ^= 1
        chsh_score = 2.50

    elif scenario == AttackType.MITM:
        # Intercept-Resend Attack: Eve measures in random bases and resends
        eve_bases = rng.choice(["Z", "X"], size=key_length)
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()

        # Eve measures Alice states in Eve bases
        eve_bits = list(alice_bits)
        for i in range(key_length):
            if alice_bases[i] != eve_bases[i]:
                eve_bits[i] = int(rng.integers(0, 2))

        # Bob measures Eve states in Bob bases
        bob_bits = list(eve_bits)
        for i in range(key_length):
            if eve_bases[i] != bob_bases[i]:
                bob_bits[i] = int(rng.integers(0, 2))

        chsh_score = 1.80  # Degraded entanglement score

    elif scenario == AttackType.FORGERY:
        # Classical Feed-Forward Forgery: Bits corrupted systematically
        bob_bases = list(alice_bases)  # All bases match
        bob_bits = list(alice_bits)
        # Flip 35% of bits
        forgery_flips = rng.random(size=key_length) < 0.35
        for i in range(key_length):
            if forgery_flips[i]:
                bob_bits[i] ^= 1
        chsh_score = 2.72

    elif scenario == AttackType.REPLAY:
        # Replay Attack: Replayed sequence from past session
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()
        bob_bits = rng.integers(0, 2, size=key_length).tolist()  # Uncorrelated
        chsh_score = 1.70

    elif scenario == AttackType.PNS:
        # Photon-Number-Splitting Attack
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()
        bob_bits = list(alice_bits)
        noise_flips = rng.random(size=key_length) < baseline_qber
        for i in range(key_length):
            if noise_flips[i]:
                bob_bits[i] ^= 1
        chsh_score = 2.72

        # Decoy state statistics showing high discrepancy
        decoy_data = DecoyStateData(
            enabled=True,
            signal=SingleStateCount(sent=10000, detected=9500, errors=190),  # 2.0%
            decoy=SingleStateCount(sent=3000, detected=2850, errors=285),   # 10.0%
        )

    else:
        bob_bases = rng.choice(["Z", "X"], size=key_length).tolist()
        bob_bits = list(alice_bits)

    session_prefix = scenario.value.upper()
    return SecurityAnalysisRequest(
        session_id=f"MOCK-{session_prefix}-001",
        block_id="BLOCK-001",
        alice=QuantumMeasurementData(bits=alice_bits, bases=alice_bases),
        bob=QuantumMeasurementData(bits=bob_bits, bases=bob_bases),
        channel=ChannelParameters(baseline_qber=baseline_qber, attack_fraction=attack_fraction),
        security_parameters=SecurityParameters(false_alarm_rate=1e-9, minimum_sifted_bits=10),
        chsh=CHSHData(enabled=True, correlation_score=chsh_score),
        decoy=decoy_data,
        attack_type=scenario,
    )
