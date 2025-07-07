from sqlalchemy import Column, Integer, String, DateTime
from app.config.database import Base

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=False)
    ubicacion = Column(String, nullable=True)
