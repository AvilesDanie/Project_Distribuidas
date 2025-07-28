import uuid
from sqlalchemy import Column, Integer, String, Float
from app.config.database import Base

class Entrada(Base):
    __tablename__ = "entradas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, nullable=False)
    evento_id = Column(Integer, nullable=False)
    evento_nombre = Column(String, nullable=True)  # ✅ NUEVA LÍNEA
    usuario_id = Column(Integer, nullable=True)

    precio = Column(Float, nullable=False, default=0.0)
    estado = Column(String, default="activa")  # 'activa' o 'cancelada'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.codigo:
            self.codigo = str(uuid.uuid4())