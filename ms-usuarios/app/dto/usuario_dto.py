from pydantic import BaseModel, EmailStr
from typing import Optional

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
        from_attributes = True
