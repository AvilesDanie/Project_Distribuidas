from sqlalchemy.orm import Session
from app.model.notificacion_model import Notificacion
from app.dto.notificacion_dto import NotificacionCreateDTO

def crear_notificacion(db: Session, data: NotificacionCreateDTO):
    noti = Notificacion(**data.dict())
    db.add(noti)
    db.commit()
    db.refresh(noti)
    return noti

def obtener_notificaciones_usuario(db: Session, usuario_id: int):
    """Obtener notificaciones de un usuario específico Y las globales"""
    from sqlalchemy import or_
    return db.query(Notificacion).filter(
        or_(
            Notificacion.usuario_id == usuario_id,
            Notificacion.usuario_id == None  # Incluir notificaciones globales
        )
    ).order_by(Notificacion.fecha_envio.desc()).limit(50).all()

def obtener_notificaciones_globales(db: Session):
    """Obtener notificaciones globales (sin usuario específico)"""
    return db.query(Notificacion).filter(
        Notificacion.usuario_id == None
    ).order_by(Notificacion.fecha_envio.desc()).limit(50).all()

def marcar_como_leida(db: Session, notification_id: int, user_id: int):
    """Marcar una notificación específica como leída"""
    from sqlalchemy import or_
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notification_id,
        or_(
            Notificacion.usuario_id == user_id,
            Notificacion.usuario_id == None  # Notificaciones globales
        )
    ).first()
    
    if notificacion:
        notificacion.leida = True
        db.commit()
        return True
    return False

def marcar_todas_como_leidas(db: Session, user_id: int):
    """Marcar todas las notificaciones de un usuario como leídas"""
    from sqlalchemy import or_
    count = db.query(Notificacion).filter(
        or_(
            Notificacion.usuario_id == user_id,
            Notificacion.usuario_id == None  # Notificaciones globales
        ),
        Notificacion.leida == False
    ).update({"leida": True})
    db.commit()
    return count

def eliminar_notificacion(db: Session, notification_id: int, user_id: int):
    """Eliminar una notificación específica"""
    from sqlalchemy import or_
    notificacion = db.query(Notificacion).filter(
        Notificacion.id == notification_id,
        or_(
            Notificacion.usuario_id == user_id,
            Notificacion.usuario_id == None  # Solo permitir borrar globales si es admin
        )
    ).first()
    
    if notificacion:
        db.delete(notificacion)
        db.commit()
        return True
    return False
