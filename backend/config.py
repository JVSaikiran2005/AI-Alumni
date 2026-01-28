import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://alumni_user:alumni_password@localhost:5432/alumniconnect"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
