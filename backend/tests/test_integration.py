"""
Integration Tests for GHZ + QuARC Adapters and QDS Bridge.
"""

import pytest

from app.ghz.models import GHZVerificationDecision
from app.ghz.service import GHZService
from app.integration.ghz_quarc_adapter import GHZQuARCAdapter
from app.integration.qds_adapter import QDSAdapter
from app.integration.quantum_network_adapter import QuantumNetworkAdapter
from app.quarc.models import NodeType
from app.quarc.service import QuARCService
from app.quarc.topology import QuantumTopology


@pytest.fixture
def integrated_environment():
    """Setup integrated test environment with QuARC topology and GHZ service."""
    topo = QuantumTopology()
    quarc = QuARCService(topo)
    ghz = GHZService()

    # Create 3-party topology (Alice, Bob, Charlie with intermediate quantum routers)
    quarc.add_node("alice", node_type=NodeType.CLIENT)
    quarc.add_node("bob", node_type=NodeType.CLIENT)
    quarc.add_node("charlie", node_type=NodeType.CLIENT)
    quarc.add_node("router_ab", node_type=NodeType.ROUTER)
    quarc.add_node("router_ac", node_type=NodeType.ROUTER)

    quarc.add_link("l_a_rab", "alice", "router_ab", fidelity=0.99, latency=2.0)
    quarc.add_link("l_rab_b", "router_ab", "bob", fidelity=0.99, latency=2.0)
    quarc.add_link("l_a_rac", "alice", "router_ac", fidelity=0.98, latency=3.0)
    quarc.add_link("l_rac_c", "router_ac", "charlie", fidelity=0.98, latency=3.0)

    adapter = GHZQuARCAdapter(ghz_svc=ghz, quarc_svc=quarc)
    net_adapter = QuantumNetworkAdapter(adapter=adapter)
    qds_adapt = QDSAdapter(net_adapter=net_adapter)

    return {
        "ghz": ghz,
        "quarc": quarc,
        "adapter": adapter,
        "net_adapter": net_adapter,
        "qds_adapter": qds_adapt,
    }


def test_quarc_route_to_ghz(integrated_environment):
    """Test routing multi-party paths with QuARC and distributing 3-qubit GHZ state."""
    adapter = integrated_environment["adapter"]

    res = adapter.route_and_distribute_ghz(
        participants=["alice", "bob", "charlie"],
        coordinator="alice",
        shots=500,
    )

    assert res["ghz_id"].startswith("GHZ-")
    assert res["coordinator"] == "alice"
    assert res["routing_paths"]["bob"] == ["alice", "router_ab", "bob"]
    assert res["routing_paths"]["charlie"] == ["alice", "router_ac", "charlie"]
    assert res["status"] == "DISTRIBUTED"


def test_ghz_verification_pipeline(integrated_environment):
    """Test full measurement and statistical verification pipeline via adapter."""
    adapter = integrated_environment["adapter"]

    dist = adapter.route_and_distribute_ghz(
        participants=["alice", "bob", "charlie"],
        shots=1000,
    )

    # Measure in X basis (parity check)
    result = adapter.measure_and_verify_session(
        ghz_id=dist["ghz_id"],
        basis=["X", "X", "X"],
    )

    assert result["verified"] is True
    assert result["verdict"] == "PASS"
    assert result["error_count"] == 0
    assert result["parity_passed"] is True


def test_quantum_session_adapter(integrated_environment):
    """Test QuantumNetworkAdapter complete end-to-end session execution."""
    net_adapter = integrated_environment["net_adapter"]

    session = net_adapter.establish_quantum_session(
        participants=["alice", "bob", "charlie"],
        basis=["Z", "Z", "Z"],
        shots=1000,
    )

    assert session["session_id"].startswith("QNET-")
    assert session["status"] == "COMPLETED"
    assert session["verified"] is True
    assert session["qber"] == 0.0


def test_qds_security_audit_adapter(integrated_environment):
    """Test QDSAdapter evaluating GHZ verification against QDS Hoeffding security engine."""
    ghz = integrated_environment["ghz"]
    qds_adapt = integrated_environment["qds_adapter"]

    state = ghz.create_state(participants=["alice", "bob", "charlie"], shots=1000)
    ghz.measure(state, basis=["X", "X", "X"])
    verification = ghz.verify(state)

    audit = qds_adapt.audit_ghz_with_qds_security(verification)
    assert audit["decision"] == "ACCEPT"
    assert audit["qber_pass"] is True
    assert audit["parity_pass"] is True
    assert audit["threat_detected"] is False
