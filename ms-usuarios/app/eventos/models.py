from sqlalchemy import Column, Integer, String, Date, Time, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class EstadoEventoEnum(str, enum.Enum):
    creado = "creado"
    publicado = "publicado"
    finalizado = "finalizado"
    desactivado = "desactivado"

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    fecha = Column(Date)
    hora = Column(Time)
    ubicacion = Column(String)
    tipo = Column(String)
    categorias = Column(String)
    aforo = Column(Integer)
    estado = Column(Enum(EstadoEventoEnum), default=EstadoEventoEnum.creado)

    entradas = relationship("Entrada", back_populates="evento")
