from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ms-eventos"
    APP_PORT: int = 8001

    DATABASE_URL: str
    SECRET_KEY: str
    RABBITMQ_URL: str
    RABBITMQ_QUEUE: str

    class Config:
        env_file = ".env"

settings = Settings()
