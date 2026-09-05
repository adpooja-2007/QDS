"""
Independent Unit and Integration Tests for QuARC (Quantum Adaptive Routing using Clusters) Module.
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.quarc.exceptions import LinkNotFound, NodeNotFound, RerouteFailed, RouteNotFound
from app.quarc.models import LinkStatus, NodeStatus, NodeType, RouteConstraint
from app.quarc.service import QuARCService
from app.quarc.topology import QuantumTopology


@pytest.fixture
def empty_quarc():
    return QuARCService(QuantumTopology())


@pytest.fixture
def standard_network():
    """
    Standard diamond test network:
        Alice
         ├── Node1 ── Node3 ── Bob
         └── Node2 ── Node4 ── Bob
    """
    svc = QuARCService(QuantumTopology())
    svc.add_node("alice", node_type=NodeType.CLIENT)
    svc.add_node("bob", node_type=NodeType.CLIENT)
    svc.add_node("node1", node_type=NodeType.ROUTER)
    svc.add_node("node2", node_type=NodeType.ROUTER)
    svc.add_node("node3", node_type=NodeType.ROUTER)
    svc.add_node("node4", node_type=NodeType.ROUTER)

    # Primary Path: Alice -> Node1 -> Node3 -> Bob (Higher fidelity 0.99, lower latency 2ms)
    svc.add_link("l_a_1", "alice", "node1", distance=5.0, fidelity=0.99, latency=2.0, capacity=100)
    svc.add_link("l_1_3", "node1", "node3", distance=5.0, fidelity=0.99, latency=2.0, capacity=100)
    svc.add_link("l_3_b", "node3", "bob", distance=5.0, fidelity=0.99, latency=2.0, capacity=100)

    # Secondary Path: Alice -> Node2 -> Node4 -> Bob (Lower fidelity 0.95, higher latency 5ms)
    svc.add_link("l_a_2", "alice", "node2", distance=10.0, fidelity=0.95, latency=5.0, capacity=80)
    svc.add_link("l_2_4", "node2", "node4", distance=10.0, fidelity=0.95, latency=5.0, capacity=80)
    svc.add_link("l_4_b", "node4", "bob", distance=10.0, fidelity=0.95, latency=5.0, capacity=80)

    return svc


@pytest.fixture
def client():
    return TestClient(app)


def test_node_creation(empty_quarc):
    """Test creating quantum nodes with various roles."""
    node = empty_quarc.add_node("alice", name="Alice Client", node_type=NodeType.CLIENT)
    assert node.node_id == "alice"
    assert node.node_type == NodeType.CLIENT
    assert node.status == NodeStatus.ONLINE
    assert node.is_available is True


def test_link_creation(empty_quarc):
    """Test creating quantum links between nodes."""
    empty_quarc.add_node("alice")
    empty_quarc.add_node("bob")
    link = empty_quarc.add_link(
        "link_ab",
        "alice",
        "bob",
        distance=10.0,
        fidelity=0.97,
        latency=3.5,
    )
    assert link.link_id == "link_ab"
    assert link.fidelity == 0.97
    assert empty_quarc.topology.has_link("alice", "bob")
    assert empty_quarc.topology.has_link("bob", "alice")  # Bidirectional


def test_topology(standard_network):
    """Test topology node and link counts."""
    topo = standard_network.get_topology()
    assert topo["node_count"] == 6
    assert topo["link_count"] == 6


def test_neighbors(standard_network):
    """Test neighbor discovery."""
    nbrs = standard_network.topology.neighbors("alice")
    assert set(nbrs) == {"node1", "node2"}


def test_clustering(standard_network):
    """Test clustering manager partitions."""
    clusters = standard_network.cluster(fidelity_threshold=0.98, max_latency_threshold=3.0)
    assert len(clusters) >= 1


def test_candidate_paths(standard_network):
    """Test multiple candidate paths discovery."""
    candidates = standard_network.find_routes("alice", "bob")
    assert len(candidates) == 2
    paths = [c.path_nodes for c in candidates]
    assert ["alice", "node1", "node3", "bob"] in paths
    assert ["alice", "node2", "node4", "bob"] in paths


def test_path_metrics(standard_network):
    """Test quantitative path metric calculation."""
    candidates = standard_network.find_routes("alice", "bob")
    # Top path is Path 1 (Fidelity = 0.99^3 ≈ 0.9703)
    p1 = candidates[0]
    assert p1.metrics.hop_count == 3
    assert p1.metrics.end_to_end_fidelity > 0.95
    assert p1.metrics.total_latency_ms == 6.0
    assert p1.metrics.score > 0.0


def test_path_ranking(standard_network):
    """Test that candidate paths are ranked by composite score."""
    candidates = standard_network.find_routes("alice", "bob")
    assert candidates[0].metrics.score >= candidates[1].metrics.score
    # Path 1 should rank higher due to higher fidelity and lower latency
    assert candidates[0].path_nodes == ["alice", "node1", "node3", "bob"]


def test_route_selection(standard_network):
    """Test adaptive path selector picks the top scored path."""
    decision = standard_network.select_route("alice", "bob")
    assert decision.selected_path == ["alice", "node1", "node3", "bob"]
    assert decision.score > 0.50
    assert "Selected optimal route" in decision.reason


def test_route_constraints(standard_network):
    """Test route rejection when constraints are strict."""
    # Require fidelity >= 0.98 -> Path 1 (0.97) and Path 2 (0.85) both fail
    strict_constraint = RouteConstraint(min_fidelity=0.999)
    with pytest.raises(RouteNotFound):
        standard_network.select_route("alice", "bob", constraints=strict_constraint)


def test_failed_link(standard_network):
    """Test link failure detection."""
    standard_network.rerouter.mark_link_failed("node1", "node3")
    link = standard_network.get_link("node1", "node3")
    assert link.status == LinkStatus.FAILED
    assert link.is_available is False


def test_failed_node(standard_network):
    """Test node failure detection."""
    standard_network.rerouter.mark_node_offline("node1")
    node = standard_network.get_node("node1")
    assert node.status == NodeStatus.OFFLINE
    assert node.is_available is False


def test_rerouting(standard_network):
    """
    Test adaptive rerouting:
    When Primary path fails (node1 -> node3 failed),
    QuARC must dynamically reroute through Secondary path:
    Alice -> Node2 -> Node4 -> Bob.
    """
    initial_decision = standard_network.select_route("alice", "bob")
    assert initial_decision.selected_path == ["alice", "node1", "node3", "bob"]

    # Trigger failure on link (node1, node3)
    rerouted_decision = standard_network.reroute(
        source="alice",
        destination="bob",
        failed_path=initial_decision.selected_path,
        failed_link=("node1", "node3"),
    )

    assert rerouted_decision.selected_path == ["alice", "node2", "node4", "bob"]
    assert rerouted_decision.selected_path != initial_decision.selected_path


def test_rerouting_avoids_failed_path(standard_network):
    """Test that rerouting explicitly never reselects the failed path."""
    failed_path = ["alice", "node1", "node3", "bob"]
    rerouted = standard_network.reroute(
        source="alice",
        destination="bob",
        failed_path=failed_path,
        failed_link=("node1", "node3"),
    )
    assert rerouted.selected_path != failed_path
    assert "node1" not in rerouted.selected_path


def test_no_available_route(empty_quarc):
    """Test proper exception when no route is physically connected."""
    empty_quarc.add_node("alice")
    empty_quarc.add_node("bob")
    with pytest.raises(RouteNotFound):
        empty_quarc.select_route("alice", "bob")


def test_quarc_api_flow(client):
    """Test full FastAPI endpoint lifecycle for QuARC and Network."""
    # 1. Add nodes
    client.post("/api/v1/network/nodes", json={"node_id": "net_alice", "node_type": "CLIENT"})
    client.post("/api/v1/network/nodes", json={"node_id": "net_r1", "node_type": "ROUTER"})
    client.post("/api/v1/network/nodes", json={"node_id": "net_bob", "node_type": "CLIENT"})

    # 2. Add links
    client.post(
        "/api/v1/network/links",
        json={
            "link_id": "l_a_r1",
            "source": "net_alice",
            "destination": "net_r1",
            "fidelity": 0.99,
            "latency": 1.5,
        },
    )
    client.post(
        "/api/v1/network/links",
        json={
            "link_id": "l_r1_b",
            "source": "net_r1",
            "destination": "net_bob",
            "fidelity": 0.99,
            "latency": 1.5,
        },
    )

    # 3. Select Route
    res_route = client.post(
        "/api/v1/quarc/route",
        json={"source": "net_alice", "destination": "net_bob"},
    )
    assert res_route.status_code == 200
    assert res_route.json()["selected_path"] == ["net_alice", "net_r1", "net_bob"]

    # 4. Inspect Clusters
    res_clusters = client.get("/api/v1/quarc/clusters")
    assert res_clusters.status_code == 200
