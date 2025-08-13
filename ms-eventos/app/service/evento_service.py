from sqlalchemy.orm import Session
from sqlalchemy import func
from app.model.evento_model import Evento
from app.dto.evento_dto import EventoCreateDTO, EventoUpdateDTO
from app.repository import evento_repository
from app.events.publisher import publicar_evento_cancelado, publicar_evento_creado, publicar_evento_finalizado


def crear_evento(db: Session, evento: EventoCreateDTO):
    return evento_repository.crear_evento(db, evento)

def listar_publicados(db: Session):
    return evento_repository.obtener_publicados(db)

def listar_todos(db: Session):
    return evento_repository.obtener_todos(db)

def obtener_evento(db: Session, id: int):
    return evento_repository.obtener_por_id(db, id)

def actualizar_evento(db: Session, id: int, data: EventoUpdateDTO):
    return evento_repository.actualizar_evento(db, id, data)

def desactivar_evento(db: Session, id: int):
    return evento_repository.cambiar_estado(db, id, "CANCELADO")

def publicar_evento(db: Session, id: int):
    print(f"🔍 Intentando publicar evento con ID: {id}")
    # Primero verificar si el evento existe
    evento_existente = evento_repository.obtener_por_id(db, id)
    if not evento_existente:
        print(f"❌ Evento con ID {id} no existe")
        return None

    print(f"🔍 Estado actual del evento: {evento_existente.estado}")

    # Si ya está publicado, devolver el evento (no es error)
    if evento_existente.estado == "PUBLICADO":
        print(f"✅ Evento {id} ya está publicado")
        return evento_existente  # Ya está publicado, devolver el evento

    # Solo publicar si está en estado NO_PUBLICADO
    if evento_existente.estado != "NO_PUBLICADO":
        print(f"❌ No se puede publicar evento {id}. Estado actual: {evento_existente.estado}")
        return None  # No se puede publicar desde este estado

    print(f"🔄 Cambiando estado a PUBLICADO...")
    evento = evento_repository.cambiar_estado(db, id, "PUBLICADO")
    if evento:
        print(f"✅ Evento {id} publicado exitosamente")
        # Notificar evento creado/publicado
        try:
            publicar_evento_creado(evento.id, evento.aforo, evento.titulo, evento.precio)
        except Exception as e:
            print(f"⚠️ Error al notificar evento publicado: {e}")
    return evento

def finalizar_evento(db: Session, id: int):
    evento = evento_repository.cambiar_estado(db, id, "FINALIZADO")
    if evento:
        publicar_evento_finalizado(evento.titulo)  # ✅ notificar evento finalizado
    return evento

def eliminar_evento(db: Session, id: int):
    return evento_repository.eliminar_evento(db, id)

def obtener_categorias(db: Session):
    categorias = db.query(Evento.categoria).distinct().all()
    return [c[0] for c in categorias]


def buscar_eventos(db: Session, categoria: str, tipo: str, fecha: str, palabra: str):
    query = db.query(Evento).filter(Evento.estado == "PUBLICADO")
    if categoria:
        query = query.filter(Evento.categoria.ilike(f"%{categoria}%"))
    if tipo:
        query = query.filter(Evento.tipo.ilike(f"%{tipo}%"))
    if fecha:
        query = query.filter(Evento.fecha == fecha)
    if palabra:
        query = query.filter(
            Evento.titulo.ilike(f"%{palabra}%") |
            Evento.descripcion.ilike(f"%{palabra}%")
        )
    return query.all()

def obtener_estadisticas(db: Session):
    estados = ["NO_PUBLICADO", "PUBLICADO", "FINALIZADO", "CANCELADO"]
    conteos = db.query(Evento.estado, func.count()).group_by(Evento.estado).all()
    resultado = {estado: 0 for estado in estados}
    for estado, cantidad in conteos:
        resultado[estado] = cantidad
    return resultado

def cancelar_evento(db: Session, id: int):
    evento = evento_repository.cambiar_estado(db, id, "CANCELADO")
    if evento:
        publicar_evento_cancelado(evento.id)
    return evento

def obtener_estadisticas_eventos(db: Session):
    """Obtener estadísticas generales de eventos"""
    from sqlalchemy import func
    from app.model.evento_model import Evento
    
    # Contar eventos por estado
    estadisticas = db.query(
        Evento.estado,
        func.count(Evento.id).label('count')
    ).group_by(Evento.estado).all()
    
    # Formatear resultado
    resultado = {
        "total_eventos": 0,
        "eventos_publicados": 0,
        "eventos_borradores": 0,
        "eventos_finalizados": 0
    }
    
    for estado, count in estadisticas:
        resultado["total_eventos"] += count
        if estado == "PUBLICADO":
            resultado["eventos_publicados"] = count
        elif estado == "NO_PUBLICADO":
            resultado["eventos_borradores"] = count
        elif estado == "FINALIZADO":
            resultado["eventos_finalizados"] = count
    
    return resultado

