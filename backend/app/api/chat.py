"""
Quantum Chat Messaging API Router.
Handles quantum signed messaging between network nodes, persists chat history,
and provides live QDS validation metrics.
"""

import hashlib
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, delete, or_, and_

from app.schemas.auth import (
    ChatSendMessageRequest,
    ChatMessageResponse,
    ChatHistoryResponse,
)
from app.schemas.common import BaseResponse
from app.services.auth_service import auth_service
from app.services.session_service import session_service
from app.services.quantum_service import quantum_service
from app.services.attack_service import attack_service
from app.services.security_service import security_service
from app.core.database import get_session
from app.models.db_models import ChatMessageModel

logger = logging.getLogger("qds.chat_api")

router = APIRouter(
    prefix="/chat",
    tags=["Quantum Chat"],
)


@router.get(
    "/messages",
    response_model=ChatHistoryResponse,
    summary="Get conversation history between two nodes",
)
async def get_chat_messages(
    user1: str = Query(..., description="First participant username"),
    user2: str = Query(..., description="Second participant username"),
    limit: int = Query(100, ge=1, le=500),
):
    messages_data = await auth_service.get_messages(user1, user2, limit=limit)
    msgs = [ChatMessageResponse(**m) for m in messages_data]
    return ChatHistoryResponse(
        success=True,
        message=f"Retrieved {len(msgs)} quantum messages.",
        messages=msgs,
        total=len(msgs),
    )


@router.post(
    "/send",
    response_model=ChatMessageResponse,
    summary="Send quantum signed chat message",
    description=(
        "Executes the full 6-stage quantum pipeline:\n"
        "1. Arbitrator generates Bell EPR pairs\n"
        "2. Sender encodes and signs payload with Joint Bell Measurement\n"
        "3. Optional MitM / attack injection\n"
        "4. Receiver measures qubits and applies Pauli frame correction\n"
        "5. Basis sifting & reconciliation\n"
        "6. Hoeffding threshold & CHSH Bell test audit\n"
        "7. QuARC path routing & DB persistence"
    ),
)
async def send_chat_message(request: ChatSendMessageRequest):
    sender = request.sender.strip().lower()
    recipient = request.recipient.strip().lower()
    text = (request.text or "").strip()
    file_name = request.file_name
    file_type = request.file_type
    file_size = request.file_size
    file_data = request.file_data

    if not sender or not recipient:
        raise HTTPException(status_code=400, detail="Sender and recipient are required.")

    if not text and not file_data:
        raise HTTPException(status_code=400, detail="Message text or file attachment is required.")

    num_pairs = request.num_pairs or 1000
    baseline_noise = request.baseline_noise if request.baseline_noise is not None else 0.02
    alpha = request.alpha if request.alpha is not None else 1e-6

    # 1. Create quantum session
    session = session_service.create(
        num_pairs=num_pairs,
        baseline_noise=baseline_noise,
        alpha=alpha,
    )
    session_id = session.session_id

    # 2. Arbitrator EPR generation
    quantum_service.generate_epr(session_id, num_pairs)

    # 3. Sender signs payload (hash text + file_data if present)
    payload_to_hash = text
    if file_data:
        payload_to_hash += f"::FILE::{file_name}::{file_data[:1000]}"
    doc_hash = hashlib.sha256(payload_to_hash.encode("utf-8")).hexdigest()
    quantum_service.prepare_and_sign(session_id, doc_hash)

    # 4. Receiver verification & sifting (or attack simulation)
    if request.inject_attack or recipient == "eve":
        try:
            attack_service.intercept_resend(
                session_id=session_id,
                attack_fraction=0.60,
                basis_strategy="RANDOM",
            )
        except Exception as e:
            logger.warning("Attack injection warning: %s", e)
    else:
        quantum_service.verify(session_id)
        quantum_service.sift(session_id)

    # 5. Security audit
    audit_res = security_service.run_audit(session_id=session_id)

    decision_overall = audit_res.get("decision", {}).get("overall", "REJECT")
    is_pass = (decision_overall == "ACCEPT")
    qds_status = "VERIFIED" if is_pass else "COMPROMISED"

    metrics = audit_res.get("metrics", {})
    qber_percentage = float(metrics.get("qber_percentage", 0.0))
    chsh_score = float(metrics.get("chsh", 2.82))
    threshold_percentage = float(metrics.get("threshold_percentage", 14.0))

    # Determine QuARC route
    if recipient == "charlie":
        route_path = [sender, "Q2-Relay", recipient]
    elif recipient == "eve":
        route_path = [sender, "Tapped-Fiber", recipient]
    else:
        route_path = [sender, "Q1-Router", recipient]

    # 6. Persist message to database
    saved_msg = await auth_service.save_message(
        sender=sender,
        recipient=recipient,
        text=text,
        session_id=session_id,
        qds_status=qds_status,
        qber_percentage=qber_percentage,
        chsh_score=chsh_score,
        threshold_percentage=threshold_percentage,
        route_path=route_path,
        is_pass=is_pass,
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
        file_data=file_data,
    )

    return ChatMessageResponse(**saved_msg)


@router.delete(
    "/messages",
    response_model=BaseResponse,
    summary="Clear message history between two nodes",
)
async def clear_messages(
    user1: str = Query(..., description="First participant username"),
    user2: str = Query(..., description="Second participant username"),
):
    u1 = user1.strip().lower()
    u2 = user2.strip().lower()
    async with get_session() as db:
        stmt = delete(ChatMessageModel).where(
            or_(
                and_(ChatMessageModel.sender == u1, ChatMessageModel.recipient == u2),
                and_(ChatMessageModel.sender == u2, ChatMessageModel.recipient == u1),
            )
        )
        await db.execute(stmt)
        await db.commit()

    return BaseResponse(
        success=True,
        message=f"Chat history between {u1} and {u2} cleared.",
    )
