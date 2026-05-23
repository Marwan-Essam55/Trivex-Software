from pydantic import BaseModel, EmailStr, Field, validator
from uuid import UUID
from typing import Optional
from models.user import UserRole

class UserCreate(BaseModel):
    """Used by admins to create users (supports role assignment)."""
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.USER

    @validator("role", pre=True)
    def normalize_role(cls, v):
        if isinstance(v, str):
            return v.upper()
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
    last_name: str
    email: EmailStr
    profile_picture_url: Optional[str] = None
    role: UserRole
    available_credits: int
    is_active: bool

    class Config:
        orm_mode = True
        from_attributes = True

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
    available_credits: Optional[int] = None

    @validator("role", pre=True)
    def normalize_role(cls, v):
        if isinstance(v, str):
            return v.upper()
        return v

class UserOwnProfileUpdate(BaseModel):
    """Schema for users updating their own profile — no role/credits/email changes."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserResetPassword(BaseModel):
    new_password: str = Field(..., min_length=8)
