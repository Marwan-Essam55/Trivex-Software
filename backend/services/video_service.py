import cloudinary
import cloudinary.uploader
import uuid
from fastapi import UploadFile
from models.video import Video

def upload_video_to_cloudinary(file: UploadFile):
    """Upload a video file to Cloudinary and return (secure_url, file_size_mb, public_id, duration_seconds)."""
    result = cloudinary.uploader.upload(
        file.file,
        resource_type="video",
        folder="trivex_videos",
        public_id=f"video_{uuid.uuid4().hex}",
    )

    secure_url = result.get("secure_url")
    public_id = result.get("public_id")
    file_size_bytes = result.get("bytes", 0)
    file_size_mb = round(file_size_bytes / (1024 * 1024), 2)
    duration = result.get("duration")  # Cloudinary returns duration in seconds for videos
    duration_seconds = int(duration) if duration else None

    return secure_url, file_size_mb, public_id, duration_seconds

def upload_image_to_cloudinary(file: UploadFile) -> str:
    """Upload a profile image to Cloudinary and return the secure_url."""
    result = cloudinary.uploader.upload(
        file.file,
        resource_type="image",
        folder="trivex_avatars",
        public_id=f"avatar_{uuid.uuid4().hex}",
        transformation=[
            {"width": 400, "height": 400, "crop": "fill", "gravity": "face"}
        ],
    )
    return result.get("secure_url")

def save_uploaded_video(
    db_session,
    user_id,
    file_path: str,
    file_size_mb: float,
    cloudinary_public_id: str = None,
    duration_seconds: int = None,
    original_filename: str = None,
):
    """Save the uploaded video metadata to the database with PENDING status."""
    new_video = Video(
        user_id=user_id,
        file_path=file_path,
        file_size_mb=file_size_mb,
        cloudinary_public_id=cloudinary_public_id,
        duration_seconds=duration_seconds,
        original_filename=original_filename,
        status="PENDING",
    )
    db_session.add(new_video)
    db_session.commit()
    db_session.refresh(new_video)

    return new_video
