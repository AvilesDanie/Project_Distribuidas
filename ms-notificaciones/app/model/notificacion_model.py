from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.config.database import Base

class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    mensaje = Column(String, nullable=False)
    usuario_id = Column(Integer, nullable=True)
    fecha_envio = Column(DateTime, default=datetime.utcnow)
