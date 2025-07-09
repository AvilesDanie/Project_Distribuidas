from sqlalchemy.orm import Session
from app.model.evento_model import Evento
from app.dto.evento_dto import EventoCreateDTO, EventoUpdateDTO

def crear_evento(db: Session, evento: EventoCreateDTO):
    nuevo = Evento(**evento.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def obtener_todos(db: Session):
    return db.query(Evento).filter(Evento.estado != "DESACTIVADO").all()

def obtener_publicados(db: Session):
    return db.query(Evento).filter(Evento.estado == "PUBLICADO").all()

def obtener_por_id(db: Session, id: int):
    return db.query(Evento).filter(Evento.id == id).first()

def actualizar_evento(db: Session, id: int, data: EventoUpdateDTO):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(evento, key, value)
    db.commit()
    db.refresh(evento)
    return evento

def cambiar_estado(db: Session, id: int, nuevo_estado: str):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        return None
    evento.estado = nuevo_estado
    db.commit()
    db.refresh(evento)
    return evento

def eliminar_evento(db: Session, id: int):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if evento and evento.estado == "NO_PUBLICADO":
        db.delete(evento)
        db.commit()
        return True
    return False
