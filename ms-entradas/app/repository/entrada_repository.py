from sqlalchemy.orm import Session
from app.model.entrada_model import Entrada

def asignar_entrada(db: Session, entrada_id: int, user_id: int):
    entrada = db.query(Entrada).filter(Entrada.id == entrada_id, Entrada.usuario_id == None).first()
    if not entrada:
        return None
    entrada.usuario_id = user_id
    db.commit()
    db.refresh(entrada)
    return entrada

def mis_entradas(db: Session, user_id: int):
    return db.query(Entrada).filter(Entrada.usuario_id == user_id).all()

def historial_entradas(db: Session, usuario_id: int):
    return db.query(Entrada).filter(Entrada.usuario_id == usuario_id).all()

def get_entrada(db: Session, entrada_id: int):
    return db.query(Entrada).filter(Entrada.id == entrada_id).first()
