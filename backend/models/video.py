from sqlalchemy import Column, String, Integer
# Backend Team: هنستورد الـ Base من إعدادات الداتا بيز اللي عملناها
from database.session import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, nullable=False)
    status = Column(String, default="PENDING") 

    
    # 1. يضيف علاقة الفيديو بالـ User (Foreign Key)
    # 2. يضيف حقول الـ file_size_mb و الـ duration