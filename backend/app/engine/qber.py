"""
Quantum Bit Error Rate (QBER) Calculator (M2-F06) and Baseline Noise Model (M2-F07).
"""

from app.models.output_models import QBERResult


def calculate_qber(mismatch_count: int, sample_count: int) -> QBERResult:
    """
    Calculates QBER = mismatch_count / sample_count.
    Handles zero sifted bits edge case explicitly without dividing by zero.
    """
    if sample_count == 0:
        return QBERResult(
            qber=None,
            qber_percentage=None,
            error_count=0,
            sample_count=0,
            status="INSUFFICIENT_DATA",
            error_code="NO_SIFTED_BITS",
        )

    qber = mismatch_count / sample_count
    qber_percentage = qber * 100.0

    return QBERResult(
        qber=round(qber, 6),
        qber_percentage=round(qber_percentage, 4),
        error_count=mismatch_count,
        sample_count=sample_count,
        status="COMPLETED",
        error_code=None,
    )
