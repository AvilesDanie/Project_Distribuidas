from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str]
    fecha: datetime
    ubicacion: Optional[str]

class EventoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    fecha: datetime
    ubicacion: Optional[str]

    class Config:
        from_attributes = True
