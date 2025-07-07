from sqlalchemy.orm import Session
from app.model.evento_model import Evento

def crear_evento(db: Session, evento: Evento) -> Evento:
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento

def obtener_evento_por_id(db: Session, id: int) -> Evento | None:
    return db.query(Evento).filter(Evento.id == id).first()

def listar_eventos(db: Session) -> list[Evento]:
    return db.query(Evento).all()
