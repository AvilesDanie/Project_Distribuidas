from datetime import date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Usuario

class UsuarioBase(BaseModel):
    usuario: str
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    usuario: Optional[str]
    email: Optional[EmailStr]

class PasswordUpdate(BaseModel):
    actual: str
    nueva: str

class UsuarioResponse(UsuarioBase):
    id: int
    rol: str
    estado: str

    class Config:
        orm_mode = True

# Evento

class EventoBase(BaseModel):
    nombre: str
    descripcion: Optional[str]
    fecha: Optional[date]
    hora: Optional[time]
    ubicacion: Optional[str]
    tipo: Optional[str]
    categorias: Optional[str]
    aforo: Optional[int]
    estado: Optional[str]

class EventoResponse(EventoBase):
    id: int

    class Config:
        orm_mode = True

# Entrada

class EntradaResponse(BaseModel):
    id: int
    codigo: str
    evento: EventoResponse

    class Config:
        orm_mode = True
