from sqlalchemy import Column, Integer, String, Enum
from app.config.database import Base
import enum

class EstadoEnum(str, enum.Enum):
    activo = "activo"
    desactivado = "desactivado"

class RolEnum(str, enum.Enum):
    usuario = "usuario"
    administrador = "administrador"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    rol = Column(Enum(RolEnum), default=RolEnum.usuario)
    estado = Column(Enum(EstadoEnum), default=EstadoEnum.activo)
