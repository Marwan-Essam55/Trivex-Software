from pydantic import BaseModel
from typing import Dict, Optional, Any
from uuid import UUID
from datetime import datetime
from models.video import VideoStatus


class EmotionBreakdown(BaseModel):
    happy: float = 0.0
    neutral: float = 0.0
    confident: float = 0.0
    anxious: float = 0.0
    stressed: float = 0.0
    engaged: float = 0.0


class ExpertaConclusion(BaseModel):
    rule: str
    conclusion: str
    confidence: float


class AnalysisResults(BaseModel):
    """Structured AI analysis output combining Neural Networks + Experta engine."""
    dominant_emotion: Optional[str] = None
    confidence_score: Optional[float] = None
    reliability_score: Optional[float] = None
    nlp_summary: Optional[str] = None
    emotion_breakdown: Optional[EmotionBreakdown] = None
    experta_conclusions: Optional[list[ExpertaConclusion]] = None
    acoustic_profile: Optional[Dict[str, Any]] = None
    kinematic_state: Optional[str] = None
    timeline_segments: Optional[list[Dict[str, Any]]] = None


class AnalysisResultResponse(BaseModel):
    dominant_emotion: Optional[str] = None
    confidence_score: Optional[float] = None
    nlp_summary: Optional[str] = None
    timeline_data: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


class VideoResponse(BaseModel):
    id: UUID
    file_path: str
    cloudinary_public_id: Optional[str] = None
    original_filename: Optional[str] = None
    file_size_mb: Optional[float] = None
    duration_seconds: Optional[int] = None
    status: VideoStatus
    uploaded_at: datetime
    analysis_results: Optional[AnalysisResults] = None

    model_config = {"from_attributes": True}