"""
QDS Digital Signature Integration Adapter.

Provides the future interface connecting GHZ entanglement verification and QuARC adaptive routing
with the existing QDS security audit engine and session management.
"""

import logging
from typing import Any, Dict, List, Optional

from app.ghz.models import GHZVerificationResult
from app.integration.quantum_network_adapter import QuantumNetworkAdapter, quantum_network_adapter
from app.services.security_service import security_service

logger = logging.getLogger("qds.integration.qds_adapter")


class QDSAdapter:
    """
    Adapter linking the new GHZ + QuARC modules with existing QDS security and session architectures.
    """

    def __init__(self, net_adapter: Optional[QuantumNetworkAdapter] = None):
        self.network_adapter = net_adapter or quantum_network_adapter

    def audit_ghz_with_qds_security(
        self,
        ghz_verification: GHZVerificationResult,
        baseline_noise: float = 0.02,
        alpha: float = 1e-6,
    ) -> Dict[str, Any]:
        """
        Evaluate GHZ measurement results using the QDS Hoeffding statistical threshold engine.
        Reuses existing QDS SecurityService without modifying its implementation.
        """
        sample_size = ghz_verification.total_measurements
        observed_qber = ghz_verification.qber

        # Utilize existing QDS Hoeffding threshold formula
        threshold_info = security_service.calculate_threshold(
            sample_size=sample_size,
            baseline_qber=baseline_noise,
            alpha=alpha,
        )

        qber_pass = observed_qber <= threshold_info["threshold"]
        parity_pass = ghz_verification.parity_passed

        decision = "ACCEPT" if (qber_pass and parity_pass) else "REJECT"

        threat_detected = decision == "REJECT"
        threat_type = "GHZ_CORRELATION_LOST" if threat_detected else None

        return {
            "ghz_id": ghz_verification.ghz_id,
            "sample_size": sample_size,
            "observed_qber": observed_qber,
            "hoeffding_threshold": threshold_info["threshold"],
            "hoeffding_delta": threshold_info["delta"],
            "qber_pass": qber_pass,
            "parity_pass": parity_pass,
            "decision": decision,
            "threat_detected": threat_detected,
            "threat_type": threat_type,
        }

    def create_qds_entanglement_session(
        self,
        participants: List[str],
        document_hash: str,
        shots: int = 1000,
    ) -> Dict[str, Any]:
        """
        Future bridge: Prepares an entangled multi-party session for document signing.
        """
        session_res = self.network_adapter.establish_quantum_session(
            participants=participants,
            shots=shots,
        )

        return {
            "qds_session_id": session_res["session_id"],
            "document_hash": document_hash,
            "ghz_state_id": session_res["ghz_id"],
            "participants": session_res["participants"],
            "routing_paths": session_res["routing_paths"],
            "entanglement_status": session_res["status"],
            "verified": session_res["verified"],
            "qber": session_res["qber"],
        }


# Global singleton QDS adapter instance
qds_adapter = QDSAdapter()
