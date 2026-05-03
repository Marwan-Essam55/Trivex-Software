from pydantic import BaseModel
from typing import Dict, Optional, Any
from uuid import UUID
from datetime import datetime
from models.video import VideoStatus

class AnalysisResultResponse(BaseModel):
    dominant_emotion: Optional[str] = None
    confidence_score: Optional[float] = None
    nlp_summary: Optional[str] = None
    timeline_data: Optional[Dict[str, Any]] = None

    class Config:
        orm_mode = True
        from_attributes = True

class VideoResponse(BaseModel):
    id: UUID
    file_size_mb: Optional[float] = None
    duration_seconds: Optional[int] = None
    status: VideoStatus
    uploaded_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True