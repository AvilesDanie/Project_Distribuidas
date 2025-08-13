from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificacionCreateDTO(BaseModel):
    usuario_id: Optional[int] = None
    titulo: str = "Notificación"
    mensaje: str
    tipo: str = "info"

class NotificacionResponseDTO(BaseModel):
    id: int
    usuario_id: Optional[int]
    titulo: str
    mensaje: str
    tipo: str
    leida: bool
    fecha_creacion: datetime  # El frontend espera 'fecha_creacion' no 'fecha_envio'
    fecha_lectura: Optional[datetime] = None

    @classmethod
    def from_model(cls, notificacion):
        """Crear DTO desde el modelo, mapeando fecha_envio -> fecha_creacion"""
        return cls(
            id=notificacion.id,
            usuario_id=notificacion.usuario_id,
            titulo=notificacion.titulo,
            mensaje=notificacion.mensaje,
            tipo=notificacion.tipo,
            leida=notificacion.leida,
            fecha_creacion=notificacion.fecha_envio,  # ✅ Mapeo aquí
            fecha_lectura=notificacion.fecha_lectura
        )

    class Config:
        from_attributes = True
