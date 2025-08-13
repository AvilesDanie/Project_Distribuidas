from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.config.database import Base, engine
from app.config.settings import settings
from app.controller.evento_controller import router as evento_router
from pathlib import Path

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    root_path="/api/v1/eventos"
)

# Crear directorio de uploads si no existe
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)

# Servir archivos estáticos - las imágenes están en uploads/images/
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ Agrega el prefijo adecuado
app.include_router(evento_router, prefix="/eventos", tags=["Eventos"])
