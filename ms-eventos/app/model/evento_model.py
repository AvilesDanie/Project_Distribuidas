from sqlalchemy import (
    Column, Integer, String, Date, Time, Enum, JSON
)
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

class EstadoEvento(str, enum.Enum):
    BORRADOR   = "borrador"
    PUBLICADO  = "publicado"
    CANCELADO  = "cancelado"

class Evento(Base):
    __tablename__ = "eventos"

    id          = Column(Integer, primary_key=True, index=True)
    nombre      = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha       = Column(Date,   nullable=False)
    hora        = Column(Time,   nullable=False)
    ubicacion   = Column(String, nullable=True)
    tipo        = Column(String, nullable=False)
    categorias  = Column(JSON,   nullable=True)   # lista de categorías
    aforo       = Column(Integer, nullable=False)
    estado      = Column(Enum(EstadoEvento), default=EstadoEvento.BORRADOR, nullable=False)
