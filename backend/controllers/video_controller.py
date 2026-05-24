from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database.session import get_db
from core.security import get_current_user
from models.user import User
from models.video import Video
from services.video_service import upload_video_to_cloudinary, save_uploaded_video
from schemas.video_schema import VideoResponse

router = APIRouter(
    prefix="/api/videos",
    tags=["Videos"],
)

@router.post("/upload", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a video or audio file to Cloudinary and save metadata in the database."""
    if not file.content_type or not (file.content_type.startswith("video/") or file.content_type.startswith("audio/")):
        raise HTTPException(status_code=400, detail="File must be a video (MP4, MOV, AVI) or audio (MP3, WAV).")

    try:
        secure_url, file_size_mb, public_id, duration = upload_video_to_cloudinary(file)
        video_record = save_uploaded_video(
            db_session=db,
            user_id=current_user.id,
            file_path=secure_url,
            file_size_mb=file_size_mb,
            cloudinary_public_id=public_id,
            duration_seconds=duration,
            original_filename=file.filename,
        )
        return video_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/my", response_model=List[VideoResponse])
def list_my_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all videos uploaded by the current user."""
    videos = (
        db.query(Video)
        .filter(Video.user_id == current_user.id, Video.is_deleted == False)
        .order_by(Video.uploaded_at.desc())
        .all()
    )
    return videos

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single video by ID (must belong to the current user)."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this video")
    return video