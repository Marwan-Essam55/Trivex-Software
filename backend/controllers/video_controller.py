from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from core.security import get_current_user
from models.user import User
from services.video_service import upload_video_to_cloudinary, save_uploaded_video
from schemas.video_schema import VideoResponse

router = APIRouter()

@router.post("/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
        
    try:
        secure_url, file_size_mb = upload_video_to_cloudinary(file)
        video_record = save_uploaded_video(
            db_session=db, 
            user_id=current_user.id, 
            file_path=secure_url, 
            file_size_mb=file_size_mb
        )
        return video_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")