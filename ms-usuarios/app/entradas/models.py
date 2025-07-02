from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class Entrada(Base):
    __tablename__ = "entradas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    evento = relationship("Evento", back_populates="entradas")
    usuario = relationship("Usuario", back_populates="entradas")
