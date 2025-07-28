from pydantic import BaseModel
from typing import Optional

class EventoCreateDTO(BaseModel):
    titulo: str
    descripcion: str
    fecha: str
    categoria: str
    tipo: str
    aforo: int
    precio: float

class EventoUpdateDTO(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[str] = None
    categoria: Optional[str] = None
    tipo: Optional[str] = None
    aforo: Optional[int] = None
    precio: Optional[float] = None

class EventoOutDTO(BaseModel):
    id: int
    titulo: str
    descripcion: str
    fecha: str
    categoria: str
    tipo: str
    aforo: int
    estado: str
    precio: float

    class Config:
        from_attributes = True
