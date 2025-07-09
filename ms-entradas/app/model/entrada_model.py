import uuid
from sqlalchemy import Column, Integer, String
from app.config.database import Base

class Entrada(Base):
    __tablename__ = "entradas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, nullable=False)
    evento_id = Column(Integer, nullable=False)
    usuario_id = Column(Integer, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.codigo:
            self.codigo = str(uuid.uuid4())  # ✅ Generar código único
