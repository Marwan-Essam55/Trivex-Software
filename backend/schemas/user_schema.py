from pydantic import BaseModel, EmailStr, Field, validator
from uuid import UUID
from typing import Optional
from models.user import UserRole


class UserCreate(BaseModel):
    """Used by admins to create users (supports role assignment)."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.USER
    company_name: Optional[str] = None
    title: Optional[str] = None

    @validator("role", pre=True)
    def normalize_role(cls, v):
        if isinstance(v, str):
            v_upper = v.upper()
            allowed = {r.value for r in UserRole}
            if v_upper not in allowed:
                raise ValueError(f"Invalid role '{v}'. Must be one of: {allowed}")
            return v_upper
        return v


class RegisterUser(BaseModel):
    """Used for self-registration — no role field to prevent privilege escalation."""
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserProfileResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    profile_picture_url: Optional[str] = None
    role: UserRole
    is_active: bool
    company_name: Optional[str] = None
    title: Optional[str] = None
    created_by_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class GoogleAuthToken(BaseModel):
    token: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    company_name: Optional[str] = None
    title: Optional[str] = None

    @validator("role", pre=True)
    def normalize_role(cls, v):
        if isinstance(v, str):
            v_upper = v.upper()
            allowed = {r.value for r in UserRole}
            if v_upper not in allowed:
                raise ValueError(f"Invalid role '{v}'. Must be one of: {allowed}")
            return v_upper
        return v


class UserOwnProfileUpdate(BaseModel):
    """Schema for users updating their own profile — no role/email changes."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserResetPassword(BaseModel):
    new_password: str = Field(..., min_length=8)


class UserChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)
