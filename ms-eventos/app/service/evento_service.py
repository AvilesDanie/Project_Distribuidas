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
    return evento_repository.cambiar_estado(db, id, "DESACTIVADO")

def publicar_evento(db: Session, id: int):
    evento = evento_repository.cambiar_estado(db, id, "PUBLICADO")
    if evento:
        publicar_evento_creado(evento.id, evento.aforo, evento.titulo, evento.precio)
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
    estados = ["NO_PUBLICADO", "PUBLICADO", "FINALIZADO", "DESACTIVADO"]
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

