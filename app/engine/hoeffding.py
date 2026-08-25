"""
Hoeffding Bound Calculator (M2-F08) and Security Threshold Calculator (M2-F09).

Formula:
P(e_hat - e_0 >= delta) <= exp(-2 * N * delta^2) = alpha
Solving for delta:
delta = sqrt( ln(1 / alpha) / (2 * N) )
Threshold T = min(1.0, e_0 + delta)
"""

import math
from app.models.output_models import ThresholdResult


def calculate_hoeffding_threshold(
    baseline_qber: float,
    sample_count: int,
    false_alarm_rate: float = 1e-9,
) -> ThresholdResult:
    """
    Calculates Hoeffding statistical error bound delta and acceptance threshold T.
    
    Parameters:
        baseline_qber (float): Expected physical channel noise rate e_0 (0.0 to 1.0).
        sample_count (int): Number of sifted sample bits N (must be >= 1).
        false_alarm_rate (float): Tail probability alpha (e.g. 1e-9).
    
    Returns:
        ThresholdResult containing delta, effective threshold, and capping flag.
    """
    if sample_count <= 0:
        # Edge case: fallback or zero sample size
        return ThresholdResult(
            baseline_qber=baseline_qber,
            sample_count=0,
            false_alarm_rate=false_alarm_rate,
            delta=1.0,
            threshold=1.0,
            is_capped=True,
        )

    # delta = sqrt( ln(1 / alpha) / (2 * N) )
    ln_inv_alpha = math.log(1.0 / false_alarm_rate)
    delta = math.sqrt(ln_inv_alpha / (2.0 * sample_count))

    raw_threshold = baseline_qber + delta
    is_capped = raw_threshold > 1.0
    effective_threshold = min(1.0, raw_threshold)

    return ThresholdResult(
        baseline_qber=round(baseline_qber, 6),
        sample_count=sample_count,
        false_alarm_rate=false_alarm_rate,
        delta=round(delta, 6),
        threshold=round(effective_threshold, 6),
        is_capped=is_capped,
    )
