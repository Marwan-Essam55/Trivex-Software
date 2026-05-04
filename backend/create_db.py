from database.session import engine, Base
from models.user import User
from models.video import Video, AnalysisResult
from models.feedback import Feedback

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
