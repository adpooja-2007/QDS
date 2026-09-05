"""
GHZ Entanglement Distribution module.

Handles distribution of 3-qubit entangled states among exactly three network participants.
Validates participant constraints and sets up logical qubit assignments.
"""

import logging
from typing import Dict, List

from app.ghz.exceptions import InvalidGHZParticipants
from app.ghz.models import GHZStateStatus
from app.ghz.state import GHZState

logger = logging.getLogger("qds.ghz.distribution")


def validate_participants(participants: List[str]) -> List[str]:
    """
    Validate participant requirements for a 3-qubit GHZ state:
    - Exactly 3 participants
    - No duplicates
    - Valid non-empty identifiers

    Returns:
        List of cleaned participant identifiers.
    """
    if not isinstance(participants, list):
        raise InvalidGHZParticipants("Participants must be provided as a list.")

    cleaned = [p.strip() for p in participants if isinstance(p, str) and p.strip()]

    if len(cleaned) != 3:
        raise InvalidGHZParticipants(
            f"GHZ state distribution requires exactly 3 participants; provided {len(cleaned)}."
        )

    if len(set(cleaned)) != 3:
        raise InvalidGHZParticipants(
            f"GHZ participants must be distinct unique identities; received duplicates: {cleaned}."
        )

    return cleaned


def distribute_ghz_state(
    state: GHZState,
    participants: List[str],
) -> Dict[int, str]:
    """
    Distribute the 3 qubits of a GHZ state to the 3 verified participants:
        q0 → Participant 0 (e.g., Alice)
        q1 → Participant 1 (e.g., Bob)
        q2 → Participant 2 (e.g., Charlie)

    Updates state status to DISTRIBUTED.

    Returns:
        Qubit mapping dictionary {0: p0, 1: p1, 2: p2}.
    """
    valid_participants = validate_participants(participants)
    mapping = {
        0: valid_participants[0],
        1: valid_participants[1],
        2: valid_participants[2],
    }

    state.participants = valid_participants
    state.qubit_mapping = mapping
    state.status = GHZStateStatus.DISTRIBUTED

    logger.info(
        "GHZ state %s distributed to participants: %s (q0=%s, q1=%s, q2=%s)",
        state.ghz_id,
        valid_participants,
        valid_participants[0],
        valid_participants[1],
        valid_participants[2],
    )

    return mapping
