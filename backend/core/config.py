import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    db_url: str = os.getenv("DATABASE_URL", "sqlite:///./trivex.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "trivex-super-secret-jwt-key-change-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")

settings = Settings()
