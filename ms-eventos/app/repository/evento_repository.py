from sqlalchemy.orm import Session
from app.model.evento_model import Evento

def crear_evento(db: Session, evento: Evento) -> Evento:
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento

def obtener_evento_por_id(db: Session, id: int) -> Evento | None:
    return db.query(Evento).filter(Evento.id == id).first()

def listar_eventos(db: Session, *, skip: int = 0, limit: int = 100) -> list[Evento]:
    return db.query(Evento).offset(skip).limit(limit).all()

def actualizar_evento(db: Session, evt: Evento) -> Evento:
    db.commit()
    db.refresh(evt)
    return evt

def eliminar_evento(db: Session, evt: Evento) -> None:
    db.delete(evt)
    db.commit()
