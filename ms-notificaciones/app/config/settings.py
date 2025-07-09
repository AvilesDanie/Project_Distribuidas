from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ms-notificaciones"
    DATABASE_URL: str
    RABBITMQ_URL: str
    RABBITMQ_QUEUE: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
