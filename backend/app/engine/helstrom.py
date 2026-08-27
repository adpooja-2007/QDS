"""
Helstrom Minimum Error Bound Calculator for Quantum State Discrimination.
Evaluates the physical limit of eavesdropper state discrimination P_e >= (1 - ||pi_0 rho_0 - pi_1 rho_1||_1) / 2.
"""

import numpy as np
from app.models.output_models import HelstromResult


def evaluate_helstrom_bound(
    overlap_gamma: float = 0.70710678,
    prior_0: float = 0.5,
    prior_1: float = 0.5,
) -> HelstromResult:
    """
    Calculates the Helstrom minimum error discrimination bound between two quantum states |psi_0> and |psi_1>.
    For pure states with overlap gamma = <psi_0|psi_1>, trace distance D = sqrt(1 - 4 * pi_0 * pi_1 * gamma^2).
    Helstrom bound P_e = (1 - D) / 2.
    """
    gamma_sq = float(overlap_gamma ** 2)
    trace_distance = np.sqrt(max(0.0, 1.0 - 4.0 * prior_0 * prior_1 * gamma_sq))
    
    # Helstrom Error Probability Bound
    min_error_probability = float(0.5 * (1.0 - trace_distance))
    max_discrimination_fidelity = float(1.0 - min_error_probability)
    
    # If Eve attempts discrimination, any probe error below min_error_probability is physically impossible
    optimum_discrimination = float(min_error_probability)

    return HelstromResult(
        overlap_gamma=round(float(overlap_gamma), 6),
        prior_probability_0=prior_0,
        prior_probability_1=prior_1,
        trace_distance=round(float(trace_distance), 6),
        min_error_probability=round(optimum_discrimination, 6),
        max_fidelity=round(max_discrimination_fidelity, 6),
        status="BOUND_ENFORCED",
    )
