"""
Pydantic schemas for User Authentication and Chat messaging.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from app.schemas.common import BaseResponse


class UserLoginRequest(BaseModel):
    username: str
    password: str


class UserRegisterRequest(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None
    role: Optional[str] = "Quantum Node"


class UserProfile(BaseModel):
    username: str
    display_name: str
    role: str
    node_id: str
    avatar_text: str
    avatar_bg: str
    created_at: Optional[str] = None


class AuthResponse(BaseResponse):
    user: Optional[UserProfile] = None
    token: Optional[str] = None


class UserListResponse(BaseResponse):
    users: List[UserProfile] = []


class ChatSendMessageRequest(BaseModel):
    sender: str
    recipient: str
    text: str = ""
    num_pairs: Optional[int] = 1000
    baseline_noise: Optional[float] = 0.02
    alpha: Optional[float] = 0.000001
    inject_attack: Optional[bool] = False
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    file_data: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    recipient: str
    text: str
    session_id: str
    qds_status: str
    qber_percentage: float
    chsh_score: float
    threshold_percentage: float
    route_path: List[str]
    is_pass: bool
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    file_data: Optional[str] = None
    timestamp: Optional[str] = None


class ChatHistoryResponse(BaseResponse):
    messages: List[ChatMessageResponse] = []
    total: int = 0
