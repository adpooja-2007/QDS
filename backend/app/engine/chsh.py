"""
CHSH Entanglement Evaluator (Feature M2-F11).
Evaluates observed CHSH score S against classical bound S <= 2.0 and quantum limit S <= 2.8284.
"""

from app.engine.constants import CHSH_CLASSICAL_BOUND, CHSH_QUANTUM_LIMIT
from app.models.enums import CHSHStatus
from app.models.output_models import CHSHResult


def evaluate_chsh_score(
    score: float | None,
    enabled: bool = True,
) -> CHSHResult:
    """
    Evaluates CHSH correlation score S.
    
    Categories:
        S >= 2.4: STRONG_ENTANGLEMENT
        2.0 <= S < 2.4: WEAK_ENTANGLEMENT
        S < 2.0: BELL_TEST_FAILED
    """
    if not enabled or score is None:
        return CHSHResult(
            score=score,
            classical_bound=CHSH_CLASSICAL_BOUND,
            quantum_limit=CHSH_QUANTUM_LIMIT,
            bell_violation=False,
            status=CHSHStatus.DISABLED,
        )

    bell_violation = score >= CHSH_CLASSICAL_BOUND

    if score >= 2.4:
        status = CHSHStatus.STRONG_ENTANGLEMENT
    elif score >= 2.0:
        status = CHSHStatus.WEAK_ENTANGLEMENT
    else:
        status = CHSHStatus.BELL_TEST_FAILED

    return CHSHResult(
        score=round(score, 4),
        classical_bound=CHSH_CLASSICAL_BOUND,
        quantum_limit=round(CHSH_QUANTUM_LIMIT, 6),
        bell_violation=bell_violation,
        status=status,
    )
