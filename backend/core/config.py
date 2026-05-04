import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    db_url: str = os.getenv("DATABASE_URL", "sqlite:///./trivex.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "your-super-secret-key-trivex")
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")

settings = Settings()
