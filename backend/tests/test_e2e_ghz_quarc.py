"""
End-to-End Test for GHZ + QuARC Workflow and Dynamic Rerouting Demonstration.
"""

import pytest

from app.ghz.models import GHZVerificationDecision
from app.ghz.service import GHZService
from app.integration.ghz_quarc_adapter import GHZQuARCAdapter
from app.integration.quantum_network_adapter import QuantumNetworkAdapter
from app.quarc.models import LinkStatus, NodeType
from app.quarc.service import QuARCService
from app.quarc.topology import QuantumTopology


def test_e2e_workflow_and_dynamic_rerouting():
    r"""
    Complete End-to-End Quantum Network Test:
    
    Topology:
                        Node1 ─── Node3
                       /               \
        Alice ─────────                 ─── Bob
                       \               /
                        Node2 ─── Node4
                               │
                            Charlie

    Workflow:
    1. QuARC topological setup and clustering.
    2. Adaptive route selection from Alice to Bob (Primary: Alice -> Node1 -> Node3 -> Bob).
    3. 3-Party GHZ entanglement state distribution (Alice, Bob, Charlie).
    4. Qiskit circuit execution and multi-basis measurement.
    5. Statistical parity verification and QBER derivation.
    6. Simulated link failure on Node1 <-> Node3.
    7. QuARC adaptive rerouting avoiding failed path (Rerouted: Alice -> Node2 -> Node4 -> Bob).
    8. New GHZ session established over rerouted topology.
    """
    # ── Step 1: Topology Construction ──────────────────────────────────
    topo = QuantumTopology()
    quarc = QuARCService(topo)
    ghz = GHZService()

    quarc.add_node("alice", node_type=NodeType.CLIENT)
    quarc.add_node("bob", node_type=NodeType.CLIENT)
    quarc.add_node("charlie", node_type=NodeType.CLIENT)
    quarc.add_node("node1", node_type=NodeType.ROUTER)
    quarc.add_node("node2", node_type=NodeType.ROUTER)
    quarc.add_node("node3", node_type=NodeType.ROUTER)
    quarc.add_node("node4", node_type=NodeType.ROUTER)

    # Primary High-Quality Route (Alice -> Node1 -> Node3 -> Bob)
    quarc.add_link("l_a_1", "alice", "node1", distance=2.0, fidelity=0.99, latency=1.0)
    quarc.add_link("l_1_3", "node1", "node3", distance=2.0, fidelity=0.99, latency=1.0)
    quarc.add_link("l_3_b", "node3", "bob", distance=2.0, fidelity=0.99, latency=1.0)

    # Backup Route (Alice -> Node2 -> Node4 -> Bob)
    quarc.add_link("l_a_2", "alice", "node2", distance=4.0, fidelity=0.96, latency=2.5)
    quarc.add_link("l_2_4", "node2", "node4", distance=4.0, fidelity=0.96, latency=2.5)
    quarc.add_link("l_4_b", "node4", "bob", distance=4.0, fidelity=0.96, latency=2.5)

    # Link to Charlie
    quarc.add_link("l_2_c", "node2", "charlie", distance=2.0, fidelity=0.98, latency=1.5)

    adapter = GHZQuARCAdapter(ghz_svc=ghz, quarc_svc=quarc)
    net_adapter = QuantumNetworkAdapter(adapter=adapter)

    # ── Step 2: Clustering & Primary Route Selection ───────────────────
    clusters = quarc.cluster(fidelity_threshold=0.95, max_latency_threshold=3.0)
    assert len(clusters) >= 1

    primary_route = quarc.select_route("alice", "bob")
    assert primary_route.selected_path == ["alice", "node1", "node3", "bob"]
    assert primary_route.metrics.end_to_end_fidelity > 0.95

    # ── Step 3, 4 & 5: GHZ Distribution, Measurement, Verification ──────
    session_1 = net_adapter.establish_quantum_session(
        participants=["alice", "bob", "charlie"],
        coordinator="alice",
        basis=["X", "X", "X"],
        shots=1000,
    )

    assert session_1["status"] == "COMPLETED"
    assert session_1["verified"] is True
    assert session_1["qber"] == 0.0
    assert session_1["parity_passed"] is True
    assert session_1["routing_paths"]["bob"] == ["alice", "node1", "node3", "bob"]

    # ── Step 6: Failure Simulation on Primary Route ────────────────────
    quarc.rerouter.mark_link_failed("node1", "node3", "Physical fiber severed")
    failed_link = quarc.get_link("node1", "node3")
    assert failed_link.status == LinkStatus.FAILED

    # ── Step 7: Adaptive Rerouting ────────────────────────────────────
    rerouted = quarc.reroute(
        source="alice",
        destination="bob",
        failed_path=["alice", "node1", "node3", "bob"],
        failed_link=("node1", "node3"),
    )

    # Proves QuARC adaptively selects the backup path and avoids failed path
    assert rerouted.selected_path == ["alice", "node2", "node4", "bob"]
    assert "node1" not in rerouted.selected_path
    assert "node3" not in rerouted.selected_path

    # ── Step 8: Establish New Session along Rerouted Topology ──────────
    session_2 = net_adapter.establish_quantum_session(
        participants=["alice", "bob", "charlie"],
        coordinator="alice",
        basis=["Z", "Z", "Z"],
        shots=1000,
    )

    assert session_2["status"] == "COMPLETED"
    assert session_2["verified"] is True
    assert session_2["routing_paths"]["bob"] == ["alice", "node2", "node4", "bob"]
