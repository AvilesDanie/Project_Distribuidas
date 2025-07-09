from fastapi import FastAPI
from app.config.database import Base, engine
from app.controller.evento_controller import router as evento_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservicio de Eventos")

# ✅ Agrega el prefijo adecuado
app.include_router(evento_router, prefix="/api/v1/eventos", tags=["Eventos"])
