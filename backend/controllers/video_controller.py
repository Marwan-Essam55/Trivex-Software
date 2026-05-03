from fastapi import APIRouter
from services.video_service import save_uploaded_video
from schemas.video_schema import VideoResponse

router = APIRouter()

@router.post("/upload", response_model=VideoResponse)
async def upload_video(file_name: str):
    # Controller مش بيفكر، بينادي الـ Service تنفذ الشغل
    video_record = save_uploaded_video(db_session=None, file_name=file_name)
    
    return video_record

    # 1. يظبط الـ db_session الحقيقي (Dependency Injection)
    # 2. يستقبل الـ UploadFile من الفرونت إند بدل الـ String