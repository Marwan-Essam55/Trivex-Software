from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from models.user import UserRole

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    profile_picture_url: Optional[str] = None
    role: UserRole
    available_credits: int

    class Config:
        orm_mode = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
