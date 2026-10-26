import re
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRegisterRequest(BaseModel):
    username: str = Field(
        ...,
        description="Username must have at least 5 letters and contain both uppercase and lowercase characters.",
        example="PlayerOne",
    )
    password: str = Field(
        ...,
        description="Password must have at least 5 characters with alpha, numeric, and special characters ($, %, *, &, #, @, !).",
        example="Secret*123",
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 5:
            raise ValueError("Username must be at least 5 characters long.")
        if not re.search(r"[a-z]", v):
            raise ValueError(
                "Username must contain at least one lowercase letter."
            )
        if not re.search(r"[A-Z]", v):
            raise ValueError(
                "Username must contain at least one uppercase letter."
            )
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 5:
            raise ValueError("Password must be at least 5 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[$%*&#@!]", v):
            raise ValueError(
                "Password must contain at least one special character from: $, %, *, &, #, @, !"
            )
        return v


class UserLoginRequest(BaseModel):
    username: str = Field(..., example="PlayerOne")
    password: str = Field(..., example="Secret*123")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    user_id: UUID


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    role: str
    created_at: datetime
