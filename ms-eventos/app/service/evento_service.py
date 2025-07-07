from sqlalchemy.orm import Session
from app.model.evento_model import Evento
from app.dto.evento_dto import EventoCreate, EventoUpdate
from app.repository.evento_repository import (
    crear_evento, obtener_evento_por_id, listar_eventos,
    actualizar_evento, eliminar_evento
)
from app.events.publisher import publish_evento_creado

def crear_nuevo_evento(db: Session, data: EventoCreate):
    evento = Evento(**data.dict())
    evt = crear_evento(db, evento)
    publish_evento_creado(evt.id)
    return evt

def get_evento(db: Session, id: int):
    evt = obtener_evento_por_id(db, id)
    if not evt:
        raise ValueError("Evento no encontrado")
    return evt

def get_eventos(db: Session, skip: int = 0, limit: int = 100):
    return listar_eventos(db, skip=skip, limit=limit)

def update_evento(db: Session, id: int, data: EventoUpdate):
    evt = get_evento(db, id)
    for field, val in data.dict(exclude_unset=True).items():
        setattr(evt, field, val)
    return actualizar_evento(db, evt)

def delete_evento(db: Session, id: int):
    evt = get_evento(db, id)
    eliminar_evento(db, evt)
