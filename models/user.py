import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Enum as SQLEnum, Uuid, ForeignKey
from sqlalchemy.orm import relationship
from database.session import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    profile_picture_url = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    google_id = Column(String, nullable=True, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    available_credits = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Company & Title Isolation fields
    company_name = Column(String, nullable=True)
    title = Column(String, nullable=True)
    created_by_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")
