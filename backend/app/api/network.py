"""
FastAPI Router for Quantum Network Topology modeling.

Exposes endpoints for registering nodes, links, and inspecting network graphs.
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.quarc.exceptions import LinkNotFound, NodeNotFound, QuARCError
from app.quarc.models import LinkStatus, NodeStatus, NodeType
from app.quarc.service import quarc_service
from app.schemas.network import (
    LinkCreateRequest,
    LinkResponse,
    NodeCreateRequest,
    NodeResponse,
    TopologyResponse,
)

logger = logging.getLogger("qds.api.network")

router = APIRouter(prefix="/network", tags=["Quantum Network Topology"])


@router.post(
    "/nodes",
    response_model=NodeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add quantum node",
    description="Register a new quantum node in the topology.",
)
async def add_node(req: NodeCreateRequest):
    try:
        node_type = NodeType(req.node_type.upper())
        node_status = NodeStatus(req.status.upper())
        node = quarc_service.add_node(
            node_id=req.node_id,
            name=req.name or req.node_id,
            node_type=node_type,
            status=node_status,
            capacity=req.capacity,
            metadata=req.metadata,
        )
        return NodeResponse(**node.to_dict())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except QuARCError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/nodes",
    response_model=List[NodeResponse],
    summary="List quantum nodes",
    description="Retrieve all registered quantum network nodes.",
)
async def list_nodes():
    return [NodeResponse(**n.to_dict()) for n in quarc_service.topology.nodes.values()]


@router.get(
    "/nodes/{node_id}",
    response_model=NodeResponse,
    summary="Get quantum node",
    description="Retrieve details of a single quantum node.",
)
async def get_node(node_id: str):
    try:
        node = quarc_service.get_node(node_id)
        return NodeResponse(**node.to_dict())
    except NodeNotFound as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/links",
    response_model=LinkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add quantum link",
    description="Register a quantum communication channel between two existing nodes.",
)
async def add_link(req: LinkCreateRequest):
    try:
        link_status = LinkStatus(req.status.upper())
        link = quarc_service.add_link(
            link_id=req.link_id,
            source=req.source,
            destination=req.destination,
            distance=req.distance,
            fidelity=req.fidelity,
            latency=req.latency,
            capacity=req.capacity,
            success_probability=req.success_probability,
            error_rate=req.error_rate,
            status=link_status,
            bidirectional=req.bidirectional,
            metadata=req.metadata,
        )
        return LinkResponse(**link.to_dict())
    except (NodeNotFound, ValueError, QuARCError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/topology",
    response_model=TopologyResponse,
    summary="Get network topology",
    description="Retrieve complete topology graph with all nodes and links.",
)
async def get_topology():
    nodes = [NodeResponse(**n.to_dict()) for n in quarc_service.topology.nodes.values()]
    links = [LinkResponse(**l.to_dict()) for l in quarc_service.topology.links.values()]
    return TopologyResponse(
        node_count=len(nodes),
        link_count=len(links),
        nodes=nodes,
        links=links,
    )
