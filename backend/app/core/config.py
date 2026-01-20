from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CyberBuddy Backend"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./cyberbuddy.db"

settings = Settings()
