from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dto.notificacion_dto import NotificacionCreateDTO, NotificacionResponseDTO
from app.service.notificacion_service import procesar_notificacion
from app.security.dependencies import require_admin, get_current_user
from typing import List

router = APIRouter()

@router.post("/notificaciones-usuario", response_model=NotificacionResponseDTO)
async def notificar_usuario(
    dto: NotificacionCreateDTO,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    try:
        return await procesar_notificacion(db, dto)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notificaciones-nuevoevento", response_model=NotificacionResponseDTO)
async def notificar_evento(
    dto: NotificacionCreateDTO,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    try:
        return await procesar_notificacion(db, dto)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notificaciones-eventofinalizado", response_model=NotificacionResponseDTO)
async def notificar_cierre(
    dto: NotificacionCreateDTO,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    try:
        return await procesar_notificacion(db, dto)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notificaciones-compra-entrada", response_model=NotificacionResponseDTO)
async def notificar_compra(
    dto: NotificacionCreateDTO,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    try:
        return await procesar_notificacion(db, dto)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contador-no-leidas")
async def contador_no_leidas(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener contador de notificaciones no leídas"""
    try:
        from app.repository.notificacion_repository import obtener_notificaciones_usuario
        notificaciones = obtener_notificaciones_usuario(db, user["id"])
        count = len([n for n in notificaciones if not n.leida])
        return {"count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mis-notificaciones", response_model=List[NotificacionResponseDTO])
async def obtener_mis_notificaciones(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener notificaciones del usuario actual"""
    try:
        from app.repository.notificacion_repository import obtener_notificaciones_usuario
        notificaciones = obtener_notificaciones_usuario(db, user["id"])
        # Usar from_model para mapear correctamente los campos
        return [NotificacionResponseDTO.from_model(n) for n in notificaciones]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/marcar-leida/{notification_id}")
async def marcar_como_leida(
    notification_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar una notificación como leída"""
    try:
        from app.repository.notificacion_repository import marcar_como_leida
        result = marcar_como_leida(db, notification_id, user["id"])
        if not result:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        return {"message": "Notificación marcada como leída"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/marcar-todas-leidas")
async def marcar_todas_como_leidas(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar todas las notificaciones como leídas"""
    try:
        from app.repository.notificacion_repository import marcar_todas_como_leidas
        count = marcar_todas_como_leidas(db, user["id"])
        return {"message": f"{count} notificaciones marcadas como leídas"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{notification_id}")
async def eliminar_notificacion(
    notification_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar una notificación"""
    try:
        from app.repository.notificacion_repository import eliminar_notificacion
        result = eliminar_notificacion(db, notification_id, user["id"])
        if not result:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        return {"message": "Notificación eliminada"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
