"""
Authentication API router.
Provides registration, login, current user profile, and user directory endpoints.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException

from app.schemas.auth import (
    UserLoginRequest,
    UserRegisterRequest,
    UserProfile,
    AuthResponse,
    UserListResponse,
)
from app.services.auth_service import auth_service

logger = logging.getLogger("qds.auth_api")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication & Users"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    summary="Register a new quantum node user",
    description="Create a new user account with display name, role, and auto-assigned quantum node ID.",
)
async def register_user(request: UserRegisterRequest):
    user = await auth_service.register(
        username=request.username,
        password=request.password,
        display_name=request.display_name,
        role=request.role or "Quantum Node",
    )
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken or invalid parameters.",
        )

    profile = UserProfile(**user.to_dict())
    return AuthResponse(
        success=True,
        message=f"User {user.username} registered successfully.",
        user=profile,
        token=f"qds_token_{user.username}",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User login",
    description="Authenticate with username and password (e.g., alice:alice, bob:bob).",
)
async def login_user(request: UserLoginRequest):
    user = await auth_service.authenticate(
        username=request.username,
        password=request.password,
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password.",
        )

    profile = UserProfile(**user.to_dict())
    return AuthResponse(
        success=True,
        message=f"Welcome back, {user.display_name}!",
        user=profile,
        token=f"qds_token_{user.username}",
    )


@router.get(
    "/me",
    response_model=AuthResponse,
    summary="Get current user profile",
)
async def get_current_user(username: str):
    user_dict = await auth_service.get_user(username)
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found.")
    
    return AuthResponse(
        success=True,
        message="User profile retrieved.",
        user=UserProfile(**user_dict),
        token=f"qds_token_{user_dict['username']}",
    )


@router.get(
    "/users",
    response_model=UserListResponse,
    summary="List all registered quantum users",
    description="Retrieve list of all users in the network available for quantum chat.",
)
async def list_users(exclude: Optional[str] = None):
    users_data = await auth_service.list_users(exclude_username=exclude)
    profiles = [UserProfile(**u) for u in users_data]
    return UserListResponse(
        success=True,
        message=f"Retrieved {len(profiles)} quantum nodes.",
        users=profiles,
    )
