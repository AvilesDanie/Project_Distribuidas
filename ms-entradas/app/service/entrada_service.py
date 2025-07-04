import httpx
from sqlalchemy.orm import Session
from app.repository.entrada_repository import (
    asignar_entrada, mis_entradas, historial_entradas, get_entrada
)
from app.events.publisher import publish_entrada_comprada

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
        return response.json()
