from pydantic import BaseModel
from typing import Optional

class EventoCreateDTO(BaseModel):
    titulo: str
    descripcion: str
    fecha: str
    categoria: str
    tipo: str
    aforo: int

class EventoUpdateDTO(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[str] = None
    categoria: Optional[str] = None
    tipo: Optional[str] = None
    aforo: Optional[int] = None

class EventoOutDTO(BaseModel):
    id: int
    titulo: str
    descripcion: str
    fecha: str
    categoria: str
    tipo: str
    aforo: int
    estado: str

    class Config:
        from_attributes = True
