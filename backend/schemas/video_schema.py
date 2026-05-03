from pydantic import BaseModel

class VideoResponse(BaseModel):
    id: int
    status: str
    
    class Config:
        orm_mode = True # عشان Pydantic يفهم كلاسات SQLAlchemy

    # 1. يعمل كلاس AnalysisResultResponse يعرض فيه النتيجة والـ Confidence Score