from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import Base, engine
from app.controller.entrada_controller import router as entrada_router

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
app.include_router(entrada_router, prefix="/api/v1/entradas", tags=["Entradas"])

# 🔁 Iniciar el listener
import threading
from app.listener.consumer import start_listener

threading.Thread(target=start_listener, daemon=True).start()
