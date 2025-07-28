from sqlalchemy import Column, Integer, String, Float
from app.config.database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    fecha = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    aforo = Column(Integer, nullable=False)
    estado = Column(String, default="NO_PUBLICADO")  # Otros: PUBLICADO, FINALIZADO, DESACTIVADO

    precio = Column(Float, nullable=True)
