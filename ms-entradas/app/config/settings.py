from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ms-entradas"

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    RABBITMQ_URL: str
    RABBITMQ_QUEUE: str

    class Config:
        env_file = ".env"

settings = Settings()
