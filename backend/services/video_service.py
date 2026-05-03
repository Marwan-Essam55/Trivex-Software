from models.video import Video
# from tasks.ai_workers import process_video_task

def save_uploaded_video(db_session, file_name: str):
    # 1. بنسجل الفيديو في الداتا بيز بحالة PENDING
    new_video = Video(file_path=f"uploads/{file_name}", status="PENDING")
    db_session.add(new_video)
    db_session.commit()
    db_session.refresh(new_video)
    
    # 2. بنبعت المهمة تشتغل في الخلفية (عشان السيرفر ميعلقش)
    # process_video_task.delay(new_video.id)
    
    return new_video

    # 1. يكتب الكود الفعلي اللي بيحفظ ملف الـ MP4 على الهارد ديسك
    # 2. يكتب دالة get_history عشان ترجع فيديوهات اليوزر