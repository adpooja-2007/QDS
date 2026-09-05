"""
FastAPI Router for GHZ Quantum Entanglement operations.

Thin API wrapper delegating directly to GHZService.
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.ghz.exceptions import GHZError, InvalidBasisError, InvalidGHZParticipants
from app.ghz.service import ghz_service
from app.schemas.ghz import (
    GHZCreateRequest,
    GHZDistributeRequest,
    GHZMeasurementResponse,
    GHZMeasureRequest,
    GHZStateResponse,
    GHZVerificationResponse,
    GHZVerifyRequest,
)

logger = logging.getLogger("qds.api.ghz")

router = APIRouter(prefix="/ghz", tags=["GHZ Quantum Entanglement"])


@router.post(
    "/create",
    response_model=GHZStateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create GHZ state",
    description="Initialize a 3-qubit GHZ entanglement instance (|000⟩ + |111⟩)/√2.",
)
async def create_ghz_state(req: GHZCreateRequest):
    try:
        state = ghz_service.create_state(
            participants=req.participants,
            shots=req.shots,
            noise_rate=req.noise_rate,
            metadata=req.metadata,
        )
        return GHZStateResponse(**state.to_dict())
    except InvalidGHZParticipants as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to create GHZ state: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.post(
    "/distribute",
    response_model=GHZStateResponse,
    summary="Distribute GHZ state",
    description="Distribute a 3-qubit GHZ state to exactly 3 distinct participants.",
)
async def distribute_ghz_state(req: GHZDistributeRequest):
    try:
        ghz_service.distribute(req.ghz_id, req.participants)
        state = ghz_service.get_state(req.ghz_id)
        return GHZStateResponse(**state.to_dict())
    except InvalidGHZParticipants as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except GHZError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to distribute GHZ state: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.post(
    "/measure",
    response_model=GHZMeasurementResponse,
    summary="Measure GHZ state",
    description="Perform quantum simulation measurements in Z (computational) or X (transverse) basis.",
)
async def measure_ghz_state(req: GHZMeasureRequest):
    try:
        measurement = ghz_service.measure(
            target=req.ghz_id,
            basis=req.basis,
            shots=req.shots,
            noise_rate=req.noise_rate,
            seed=req.seed,
        )
        return GHZMeasurementResponse(
            ghz_id=measurement.ghz_id,
            basis=measurement.basis,
            shots=measurement.shots,
            raw_counts=measurement.raw_counts,
            participant_mapping=measurement.participant_mapping,
            unique_outcomes=len(measurement.raw_counts),
        )
    except InvalidBasisError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except GHZError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to measure GHZ state: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.post(
    "/verify",
    response_model=GHZVerificationResponse,
    summary="Verify GHZ measurement",
    description="Verify measurement parity, calculate QBER, and apply deterministic verification threshold.",
)
async def verify_ghz_state(req: GHZVerifyRequest):
    try:
        verification = ghz_service.verify(req.ghz_id, threshold=req.threshold)
        return GHZVerificationResponse(
            ghz_id=verification.ghz_id,
            basis=verification.basis,
            total_measurements=verification.total_measurements,
            valid_measurements=verification.valid_measurements,
            error_count=verification.error_count,
            error_rate=verification.error_rate,
            qber=verification.qber,
            parity_passed=verification.parity_passed,
            verified=verification.verified,
            decision=verification.decision.value,
            threshold=verification.threshold,
            details=verification.details,
        )
    except GHZError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to verify GHZ state: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get(
    "/{ghz_id}",
    response_model=GHZStateResponse,
    summary="Get GHZ state",
    description="Retrieve a GHZ entanglement instance by its ID.",
)
async def get_ghz_state(ghz_id: str):
    try:
        state = ghz_service.get_state(ghz_id)
        return GHZStateResponse(**state.to_dict())
    except GHZError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
