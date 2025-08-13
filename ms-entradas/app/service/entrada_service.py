import httpx
from sqlalchemy.orm import Session
from app.repository.entrada_repository import (
    get_entradas_disponibles,
    get_entradas_asignadas,
    asignar_entrada, mis_entradas, historial_entradas, get_entrada
)
from app.events.publisher import publish_entrada_comprada, publish_entrada_cancelada
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
    
def obtener_disponibles(db: Session, evento_id: int):
    return get_entradas_disponibles(db, evento_id)

def obtener_no_disponibles(db: Session, evento_id: int):
    return get_entradas_asignadas(db, evento_id)

def cancelar_entrada_usuario(db: Session, entrada_id: int, user_id: int):
    entrada = db.query(Entrada).filter(
        Entrada.id == entrada_id,
        Entrada.usuario_id == user_id,
        Entrada.estado.in_(["vendida", "reservada"])
    ).first()
    if not entrada:
        raise ValueError("Entrada no válida o ya cancelada")
    
    entrada.estado = "cancelada"
    entrada.usuario_id = None
    
    # Publicar evento de cancelación
    try:
        publish_entrada_cancelada(entrada_id, user_id)
    except Exception as e:
        print(f"⚠️ Error al publicar evento cancelación (cancelación exitosa): {e}")
    
    db.commit()
    return entrada

def comprar_entrada_por_evento(db: Session, evento_id: int, user_id: int):
    """Compra cualquier entrada disponible para un evento específico"""
    entradas_disponibles = get_entradas_disponibles(db, evento_id)
    if not entradas_disponibles:
        raise ValueError("No hay entradas disponibles para este evento")
    
    # Tomar la primera entrada disponible
    entrada = entradas_disponibles[0]
    return comprar_entrada(db, entrada.id, user_id)

def obtener_todas_entradas(db: Session):
    """Obtener todas las entradas (solo admin)"""
    return db.query(Entrada).all()

def obtener_entradas_por_evento(db: Session, evento_id: int):
    """Obtener todas las entradas de un evento específico"""
    return db.query(Entrada).filter(Entrada.evento_id == evento_id).all()

def comprar_entradas_multiple(db: Session, evento_id: int, entradas_data: list, user_id: int):
    """Comprar múltiples entradas para un evento"""
    entradas_compradas = []
    
    for entrada_info in entradas_data:
        entry_id = entrada_info.get("entryId", "general")
        quantity = entrada_info.get("quantity", 1)
        
        for _ in range(quantity):
            # Buscar entrada disponible del tipo solicitado
            entrada_disponible = db.query(Entrada).filter(
                Entrada.evento_id == evento_id,
                Entrada.usuario_id.is_(None),
                Entrada.estado == "disponible"
            ).first()
            
            if not entrada_disponible:
                raise ValueError(f"No hay entradas disponibles del tipo {entry_id}")
            
            # Comprar la entrada
            entrada_comprada = comprar_entrada(db, entrada_disponible.id, user_id)
            entradas_compradas.append(entrada_comprada)
    
    return {
        "mensaje": f"Se compraron {len(entradas_compradas)} entradas exitosamente",
        "entradas": entradas_compradas
    }

def obtener_estadisticas_ventas(db: Session):
    """Obtener estadísticas de ventas"""
    # Obtener todas las entradas vendidas (con usuario asignado)
    entradas_vendidas = db.query(Entrada).filter(
        Entrada.usuario_id.isnot(None),
        Entrada.estado.in_(["vendida", "reservada"])
    ).all()
    
    total_vendidas = len(entradas_vendidas)
    total_ingresos = sum(entrada.precio for entrada in entradas_vendidas)
    
    # Agrupar por evento
    ventas_por_evento = {}
    for entrada in entradas_vendidas:
        evento_id = entrada.evento_id
        if evento_id not in ventas_por_evento:
            ventas_por_evento[evento_id] = {
                "evento_id": evento_id,
                "cantidad": 0,
                "ingresos": 0
            }
        ventas_por_evento[evento_id]["cantidad"] += 1
        ventas_por_evento[evento_id]["ingresos"] += entrada.precio
    
    return {
        "total_vendidas": total_vendidas,
        "total_ingresos": total_ingresos,
        "ventas_por_evento": list(ventas_por_evento.values())
    }
