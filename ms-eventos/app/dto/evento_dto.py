from pydantic import BaseModel, Field
from datetime import date, time
from typing import List, Optional
import enum

class EstadoEvento(str, enum.Enum):
    borrador  = "borrador"
    publicado = "publicado"
    cancelado = "cancelado"

class EventoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha: date
    hora: time
    ubicacion: Optional[str] = None
    tipo: str = Field(..., description="e.g. conferencia, taller, espectáculo")
    categorias: Optional[List[str]] = Field(default_factory=list)
    aforo: int = Field(..., ge=0, description="Número máximo de asistentes")
    estado: EstadoEvento = EstadoEvento.borrador

class EventoUpdate(BaseModel):
    nombre: Optional[str]
    descripcion: Optional[str]
    fecha: Optional[date]
    hora: Optional[time]
    ubicacion: Optional[str]
    tipo: Optional[str]
    categorias: Optional[List[str]]
    aforo: Optional[int]
    estado: Optional[EstadoEvento]

class EventoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    fecha: date
    hora: time
    ubicacion: Optional[str]
    tipo: str
    categorias: List[str]
    aforo: int
    estado: EstadoEvento

    class Config:
        from_attributes = True
