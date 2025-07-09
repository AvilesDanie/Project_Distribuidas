from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificacionCreateDTO(BaseModel):
    tipo: str
    mensaje: str
    usuario_id: Optional[int] = None

class NotificacionResponseDTO(NotificacionCreateDTO):
    id: int
    fecha_envio: datetime

    class Config:
        from_attributes = True
