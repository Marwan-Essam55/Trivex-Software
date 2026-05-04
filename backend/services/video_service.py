import cloudinary
import cloudinary.uploader
import uuid
from fastapi import UploadFile
from models.video import Video
from core.config import settings

cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)

def upload_video_to_cloudinary(file: UploadFile):
    # Upload the file to Cloudinary
    result = cloudinary.uploader.upload(
        file.file, 
        resource_type="video", 
        folder="trivex_videos",
        public_id=f"video_{uuid.uuid4().hex}"
    )
    
    secure_url = result.get("secure_url")
    file_size_bytes = result.get("bytes", 0)
    file_size_mb = file_size_bytes / (1024 * 1024)
    
    return secure_url, file_size_mb

def save_uploaded_video(db_session, user_id, file_path: str, file_size_mb: float):
    # 1. بنسجل الفيديو في الداتا بيز بحالة PENDING
    new_video = Video(
        user_id=user_id,
        file_path=file_path, 
        file_size_mb=file_size_mb,
        status="PENDING"
    )
    db_session.add(new_video)
    db_session.commit()
    db_session.refresh(new_video)
    
    return new_video