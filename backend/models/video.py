import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Uuid, JSON
from sqlalchemy.orm import relationship
from database.session import Base

class VideoStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Video(Base):
    __tablename__ = "videos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_size_mb = Column(Float, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    status = Column(SQLEnum(VideoStatus), default=VideoStatus.PENDING)
    is_deleted = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="videos")
    result = relationship("AnalysisResult", back_populates="video", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="video", cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    video_id = Column(Uuid, ForeignKey("videos.id"), nullable=False, unique=True)
    dominant_emotion = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    nlp_summary = Column(String, nullable=True)
    timeline_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    video = relationship("Video", back_populates="result")