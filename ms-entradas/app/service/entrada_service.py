import httpx
from sqlalchemy.orm import Session
from app.repository.entrada_repository import (
    get_entradas_disponibles,
    get_entradas_asignadas,
    asignar_entrada, mis_entradas, historial_entradas, get_entrada
)
from app.events.publisher import publish_entrada_comprada
from app.model.entrada_model import Entrada

def comprar_entrada(db: Session, entrada_id: int, user_id: int):
    entrada = asignar_entrada(db, entrada_id, user_id)
    if not entrada:
        raise ValueError("Entrada no disponible")
    publish_entrada_comprada(entrada.id, user_id)
    return entrada

def obtener_mis_entradas(db: Session, user_id: int):
    return mis_entradas(db, user_id)

def historial_usuario(db: Session, usuario_id: int):
    return historial_entradas(db, usuario_id)

async def evento_por_entrada(entrada_id: int, db: Session):
    entrada = get_entrada(db, entrada_id)
    if not entrada:
        raise ValueError("Entrada no encontrada")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://eventos:8001/eventos/get-evento/{entrada.evento_id}")
        if response.status_code != 200:
            raise ValueError("Evento no encontrado")
        evento = response.json()
    return {
        "id": entrada.id,
        "codigo": entrada.codigo,
        "evento_id": entrada.evento_id,
        "evento_nombre": evento.get("titulo"),
        "usuario_id": entrada.usuario_id,
        "precio": entrada.precio,
        "estado": entrada.estado
    }
        #return response.json()
    
def obtener_disponibles(db: Session, evento_id: int):
    return get_entradas_disponibles(db, evento_id)

def obtener_no_disponibles(db: Session, evento_id: int):
    return get_entradas_asignadas(db, evento_id)

def cancelar_entrada_usuario(db: Session, entrada_id: int, user_id: int):
    entrada = db.query(Entrada).filter(
        Entrada.id == entrada_id,
        Entrada.usuario_id == user_id,
        Entrada.estado == "activa"
    ).first()
    if not entrada:
        raise ValueError("Entrada no válida o ya cancelada")
    entrada.estado = "cancelada"
    entrada.usuario_id = None
    db.commit()
    return entrada
