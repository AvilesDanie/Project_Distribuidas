from pydantic import BaseModel
from typing import Optional

class EntradaResponse(BaseModel):
    id: int
    codigo: str
    evento_id: int
    usuario_id: Optional[int]

    class Config:
        from_attributes = True
