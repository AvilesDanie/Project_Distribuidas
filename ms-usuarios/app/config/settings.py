from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ms-usuarios"

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    RABBITMQ_URL: str  # ← reemplaza múltiples valores individuales
    RABBITMQ_QUEUE: str

    class Config:
        env_file = ".env"

settings = Settings()
