from sqlalchemy.orm import Session
from app.model.entrada_model import Entrada
import random
import time

def generar_id_seguro():
    """Genera un ID seguro que JavaScript puede manejar sin perder precisión"""
    timestamp = int(time.time())  
    random_part = random.randint(100, 999)  
    return int(f"{timestamp}{random_part}")

def asignar_entrada(db: Session, entrada_id: int, user_id: int):
    entrada = db.query(Entrada).filter(
        Entrada.id == entrada_id, 
        Entrada.usuario_id == None,
        Entrada.estado == "disponible"
    ).first()
    if not entrada:
        return None
    entrada.usuario_id = user_id
    entrada.estado = "vendida"
    db.commit()
    db.refresh(entrada)
    return entrada

def mis_entradas(db: Session, user_id: int):
    return db.query(Entrada).filter(
        Entrada.usuario_id == user_id,
        Entrada.estado.in_(["vendida", "reservada"])
    ).all()

def historial_entradas(db: Session, usuario_id: int):
    # El historial debe mostrar todas las entradas del usuario (activas y canceladas)
    return db.query(Entrada).filter(Entrada.usuario_id == usuario_id).all()

def get_entrada(db: Session, entrada_id: int):
    return db.query(Entrada).filter(Entrada.id == entrada_id).first()
def get_entradas_disponibles(db: Session, evento_id: int):
    return db.query(Entrada).filter(
        Entrada.evento_id == evento_id,
        Entrada.usuario_id == None,
        Entrada.estado == "disponible"
    ).all()

def get_entradas_asignadas(db: Session, evento_id: int):
    if evento_id is None:
        # Para estadísticas generales, devolver todas las entradas vendidas
        return db.query(Entrada).filter(
            Entrada.usuario_id != None,
            Entrada.estado.in_(["vendida", "reservada"])
        ).all()
    else:
        # Para un evento específico
        return db.query(Entrada).filter(
            Entrada.evento_id == evento_id,
            Entrada.usuario_id != None,
            Entrada.estado.in_(["vendida", "reservada"])
        ).all()

def get_todas_entradas(db: Session):
    return db.query(Entrada).all()

def get_entradas_por_evento(db: Session, evento_id: int):
    return db.query(Entrada).filter(Entrada.evento_id == evento_id).all()

def get_entradas_canceladas(db: Session, evento_id: int = None):
    """Obtener entradas canceladas"""
    query = db.query(Entrada).filter(Entrada.estado == "cancelada")
    if evento_id:
        query = query.filter(Entrada.evento_id == evento_id)
    return query.all()