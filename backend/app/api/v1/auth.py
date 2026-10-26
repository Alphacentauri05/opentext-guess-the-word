from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new player",
)
def register(
    request: UserRegisterRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Register a new player account with username and password validation."""
    user = AuthService.register_user(db, request)
    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        user_id=user.id,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in user",
)
def login(
    request: UserLoginRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate with username and password, returning a JWT access token."""
    user = AuthService.authenticate_user(db, request)
    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        user_id=user.id,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Get the currently authenticated user details."""
    return current_user
