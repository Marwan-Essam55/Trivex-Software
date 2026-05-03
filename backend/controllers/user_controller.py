from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import UserProfileResponse
from models.user import User
from core.security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=UserProfileResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently logged-in user's profile.
    """
    return current_user
