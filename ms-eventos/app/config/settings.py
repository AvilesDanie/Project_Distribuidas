from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ms-eventos"

    DATABASE_URL: str
    RABBITMQ_URL: str
    RABBITMQ_QUEUE: str = "eventos_queue"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
