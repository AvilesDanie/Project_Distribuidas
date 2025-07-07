from sqlalchemy.orm import Session
from app.repository.evento_repository import crear_evento, obtener_evento_por_id, listar_eventos
from app.model.evento_model import Evento
from app.dto.evento_dto import EventoCreate
from app.events.publisher import publish_evento_creado

def crear_nuevo_evento(db: Session, evento_data: EventoCreate):
    evento = Evento(**evento_data.dict())
    evento_db = crear_evento(db, evento)
    publish_evento_creado(evento_db.id)
    return evento_db

def get_evento(id: int, db: Session):
    evento = obtener_evento_por_id(db, id)
    if not evento:
        raise ValueError("Evento no encontrado")
    return evento

def get_eventos(db: Session):
    return listar_eventos(db)
