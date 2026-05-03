import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, JSON, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from database.session import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    video_id = Column(Uuid, ForeignKey("videos.id"), nullable=False, unique=True)
    dominant_emotion = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    nlp_summary = Column(Text, nullable=True)
    timeline_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    video = relationship("Video", back_populates="result")
