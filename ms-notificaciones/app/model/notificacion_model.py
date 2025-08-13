from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.config.database import Base

class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, nullable=True)
    titulo = Column(String, nullable=False, default="Notificación")
    mensaje = Column(String, nullable=False)
    tipo = Column(String, nullable=False, default="info")
    leida = Column(Boolean, nullable=False, default=False)
    fecha_envio = Column(DateTime, default=datetime.utcnow)  # Mantener nombre original
    fecha_lectura = Column(DateTime, nullable=True)
