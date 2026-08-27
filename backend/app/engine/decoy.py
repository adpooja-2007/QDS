"""
Decoy-State Statistics Evaluator (Feature M2-F12).
Evaluates signal vs decoy photon error rates to detect anomalous photon-number distribution behavior.
"""

from app.core.config import settings
from app.models.enums import DecoyStatus
from app.models.input_models import DecoyStateData
from app.models.output_models import DecoyResult


def evaluate_decoy_statistics(decoy_data: DecoyStateData | None) -> DecoyResult:
    """
    Evaluates decoy state statistics.
    Computes signal error rate, decoy error rate, and discrepancy.
    Large discrepancy (> threshold) indicates potential PNS anomaly.
    """
    if decoy_data is None or not decoy_data.enabled:
        return DecoyResult(status=DecoyStatus.DISABLED)

    sig = decoy_data.signal
    dec = decoy_data.decoy

    if sig is None or dec is None or sig.detected == 0 or dec.detected == 0:
        return DecoyResult(status=DecoyStatus.DISABLED)

    sig_rate = sig.errors / sig.detected
    dec_rate = dec.errors / dec.detected
    diff = abs(dec_rate - sig_rate)

    is_anomalous = diff > settings.DECOY_ERROR_DISCREPANCY_THRESHOLD
    status = DecoyStatus.ANOMALOUS if is_anomalous else DecoyStatus.NORMAL

    return DecoyResult(
        signal_error_rate=round(sig_rate, 6),
        decoy_error_rate=round(dec_rate, 6),
        error_rate_difference=round(diff, 6),
        status=status,
    )
