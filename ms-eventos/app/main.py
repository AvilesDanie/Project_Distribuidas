from fastapi import FastAPI
from app.config.database import Base, engine
from app.config.settings import settings
from app.controller.evento_controller import router as evento_router

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    root_path="/api/v1/eventos"
)

app.include_router(evento_router, prefix="/eventos", tags=["eventos"])
