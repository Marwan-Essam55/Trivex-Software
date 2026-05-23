from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from schemas.user_schema import UserProfileResponse, UserOwnProfileUpdate
from models.user import User
from database.session import get_db
from core.security import get_current_user
from services import user_service
from services.video_service import upload_image_to_cloudinary

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

@router.put("/me", response_model=UserProfileResponse)
def update_own_profile(
    profile_in: UserOwnProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the currently logged-in user's own profile (first_name, last_name only).
    """
    return user_service.update_own_profile(db=db, db_user=current_user, profile_in=profile_in)

@router.post("/me/avatar", response_model=UserProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a profile picture to Cloudinary and save the URL to the user's profile.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (jpg, png, webp, etc.)")

    try:
        secure_url = upload_image_to_cloudinary(file)
        current_user.profile_picture_url = secure_url
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar upload failed: {str(e)}")

