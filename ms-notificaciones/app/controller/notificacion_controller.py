from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dto.notificacion_dto import NotificacionCreateDTO, NotificacionResponseDTO
from app.service.notificacion_service import procesar_notificacion
from app.security.dependencies import require_admin

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
