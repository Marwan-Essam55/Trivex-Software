from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Backend Team: Add DB URL, JWT Secret, and other configurations here.
    db_url: str = ""
    jwt_secret: str = ""

settings = Settings()
