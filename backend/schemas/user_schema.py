from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional
from models.user import UserRole

class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.USER

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

class UserResetPassword(BaseModel):
    new_password: str = Field(..., min_length=8)
