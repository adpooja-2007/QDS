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
    user1: str = Query(..., description="First participant username (current user)"),
    user2: str = Query(..., description="Second participant username (contact)"),
    limit: int = Query(100, ge=1, le=500),
    mark_read: bool = Query(True, description="Automatically mark incoming messages as read"),
):
    messages_data = await auth_service.get_messages(user1, user2, limit=limit, mark_read=mark_read)
    msgs = [ChatMessageResponse(**m) for m in messages_data]
    return ChatHistoryResponse(
        success=True,
        message=f"Retrieved {len(msgs)} quantum messages.",
        messages=msgs,
        total=len(msgs),
    )


@router.get(
    "/conversations",
    summary="Get summary of all conversations (latest messages + unread counts) in a single request",
)
async def get_conversations_endpoint(
    username: str = Query(..., description="Username of participant"),
):
    summary = await auth_service.get_conversations_summary(username)
    return {
        "success": True,
        **summary,
    }


@router.get(
    "/unread",
    summary="Get unread message counts per contact for a user",
)
async def get_unread_counts(
    username: str = Query(..., description="Username of recipient"),
):
    counts = await auth_service.get_unread_counts(username)
    return {
        "success": True,
        "unread_counts": counts,
        "total_unread": sum(counts.values()),
    }


@router.post(
    "/mark-read",
    summary="Mark unread messages from sender as read for current recipient",
)
async def mark_messages_read(
    recipient: str = Query(..., description="Username of the recipient (current user)"),
    sender: str = Query(..., description="Username of the contact whose messages are read"),
):
    marked = await auth_service.mark_messages_read(recipient, sender)
    return {
        "success": True,
        "message": f"Marked {marked} messages from @{sender} as read for @{recipient}.",
        "marked_count": marked,
    }


@router.get(
    "/search",
    response_model=ChatHistoryResponse,
    summary="Search message contents across conversations for a user",
)
async def search_messages_endpoint(
    username: str = Query(..., description="Username of participant"),
    q: str = Query(..., description="Text query or file name to search"),
    limit: int = Query(50, ge=1, le=200),
):
    results = await auth_service.search_messages(username, q, limit=limit)
    msgs = [ChatMessageResponse(**m) for m in results]
    return ChatHistoryResponse(
        success=True,
        message=f"Found {len(msgs)} matching quantum messages for '{q}'.",
        messages=msgs,
        total=len(msgs),
    )


@router.get(
    "/all-messages",
    response_model=ChatHistoryResponse,
    summary="Get all messages across all users for quantum ledger audit (Admin only)",
)
async def get_all_messages(
    requester: str = Query(..., description="Username of the requesting node"),
    limit: int = Query(200, ge=1, le=1000),
):
    req_username = requester.strip().lower()
    user = await auth_service.get_user(req_username)
    if not user or not (user.get("is_admin") or req_username == "admin"):
        raise HTTPException(
            status_code=403,
            detail="Access denied. Quantum Audit Ledger is restricted to Security Administrators.",
        )


    messages_data = await auth_service.get_all_messages(limit=limit)
    msgs = [ChatMessageResponse(**m) for m in messages_data]
    return ChatHistoryResponse(
        success=True,
        message=f"Retrieved {len(msgs)} total messages across all nodes for administrator @{req_username}.",
        messages=msgs,
        total=len(msgs),
    )




import os
import re
import html
from app.core.config import settings

def sanitize_filename(filename: Optional[str]) -> Optional[str]:
    """Sanitize filename to prevent path traversal and XSS injection."""
    if not filename:
        return None
    # Strip directory paths
    clean = os.path.basename(filename).replace("\\", "").replace("/", "")
    # Strip dangerous HTML/script characters
    clean = re.sub(r'[<>:"|?*\x00-\x1f]', '', clean)
    # Escape HTML entities
    clean = html.escape(clean)
    return clean[:100] if clean else "document"

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
    file_name = sanitize_filename(request.file_name)
    file_type = (request.file_type or "").strip().lower()
    file_size = request.file_size
    file_data = request.file_data

    if not sender or not recipient:
        raise HTTPException(status_code=400, detail="Sender and recipient are required.")

    if not text and not file_data:
        raise HTTPException(status_code=400, detail="Message text or file attachment is required.")

    if text and len(text) > 2000:
        raise HTTPException(status_code=400, detail="Message text exceeds maximum length of 2000 characters.")

    # ── File Upload Security Mitigations ──
    if file_data:
        # 1. Enforce strict file size limit (5MB)
        if file_size and file_size > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
            )

        # 2. Block dangerous executable and script extensions
        if file_name:
            ext = os.path.splitext(file_name)[1].lower()
            if ext in settings.BLOCKED_FILE_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Security Violation: Uploading '{ext}' executable or active script files is blocked to prevent browser exploitation."
                )

        # 3. Block malicious data URI schemes (e.g. data:text/html, javascript:)
        lower_data = file_data.strip().lower()
        if lower_data.startswith("javascript:") or lower_data.startswith("vbscript:") or "data:text/html" in lower_data or "data:application/javascript" in lower_data or "data:image/svg+xml" in lower_data:
            raise HTTPException(
                status_code=400,
                detail="Security Violation: Unsafe data URI format detected. Script execution vectors are blocked."
            )

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
        reply_to_id=request.reply_to_id,
        reply_preview=request.reply_preview,
        ephemeral_ttl=request.ephemeral_ttl,
        is_audio=bool(request.is_audio),
    )

    return ChatMessageResponse(**saved_msg)


@router.post(
    "/messages/{message_id}/pin",
    response_model=ChatMessageResponse,
    summary="Toggle pin status on a message",
)
async def toggle_pin_endpoint(
    message_id: int,
    is_pinned: bool = Query(..., description="True to pin, False to unpin"),
):
    msg = await auth_service.toggle_pin_message(message_id, is_pinned)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    return ChatMessageResponse(**msg)


@router.post(
    "/messages/{message_id}/star",
    response_model=ChatMessageResponse,
    summary="Toggle star status on a message / proof",
)
async def toggle_star_endpoint(
    message_id: int,
    is_starred: bool = Query(..., description="True to star, False to unstar"),
):
    msg = await auth_service.toggle_star_message(message_id, is_starred)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
    return ChatMessageResponse(**msg)


@router.delete(
    "/messages/{message_id}",
    response_model=BaseResponse,
    summary="Delete / purge a specific message (for ephemeral expiry or manual delete)",
)
async def delete_single_message_endpoint(
    message_id: int,
):
    success = await auth_service.delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found or already purged.")
    return BaseResponse(
        success=True,
        message=f"Message {message_id} purged successfully.",
    )


@router.get(
    "/pinned-starred",
    summary="Get all pinned and starred messages for a user/conversation",
)
async def get_pinned_starred_endpoint(
    username: str = Query(..., description="Current user username"),
    contact: Optional[str] = Query(None, description="Optional peer contact username"),
):
    data = await auth_service.get_pinned_starred_messages(username, contact)
    return {
        "success": True,
        "pinned": [ChatMessageResponse(**m) for m in data["pinned"]],
        "starred": [ChatMessageResponse(**m) for m in data["starred"]],
        "total": data["total"],
    }


@router.get(
    "/export",
    summary="Export cryptographically verifiable conversation transcript JSON",
)
async def export_transcript_endpoint(
    user1: str = Query(..., description="First participant username"),
    user2: str = Query(..., description="Second participant username"),
):
    data = await auth_service.export_chat_transcript(user1, user2)
    return {
        "success": True,
        "transcript": data,
    }


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
