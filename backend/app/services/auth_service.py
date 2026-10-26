from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserRegisterRequest, UserLoginRequest
from app.core.security import get_password_hash, verify_password


class AuthService:

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        # Check uniqueness
        existing = AuthService.get_by_username(db, request.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{request.username}' is already taken. Please choose another.",
            )

        hashed_password = get_password_hash(request.password)
        user = User(
            username=request.username,
            password_hash=hashed_password,
            role="PLAYER",  # Public registration is strictly PLAYER role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, request: UserLoginRequest) -> User:
        user = AuthService.get_by_username(db, request.username)
        if not user or not verify_password(
            request.password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
