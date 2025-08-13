from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dto.entrada_dto import EntradaResponse
from app.security.dependencies import get_current_user, require_admin
from app.service.entrada_service import (
    cancelar_entrada_usuario,
    comprar_entrada,
    obtener_mis_entradas,
    historial_usuario,
    evento_por_entrada,
    obtener_disponibles,
    obtener_no_disponibles,
    obtener_todas_entradas,
    obtener_entradas_por_evento,
    comprar_entradas_multiple,
    comprar_entrada_por_evento,
    obtener_estadisticas_ventas
)

router = APIRouter()

@router.put("/comprar-entrada/{id}", response_model=EntradaResponse)
def comprar(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        return comprar_entrada(db, id, user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/comprar-entrada-evento/{evento_id}", response_model=EntradaResponse)
def comprar_por_evento(evento_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        return comprar_entrada_por_evento(db, evento_id, user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/mis-entradas", response_model=list[EntradaResponse])
def mis_entradas(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return obtener_mis_entradas(db, user["id"])

@router.get("/historial-usuario/{id}", response_model=list[EntradaResponse])
def historial(id: int, db: Session = Depends(get_db), _: Depends = Depends(require_admin)):
    return historial_usuario(db, id)

@router.get("/evento-por-entrada/{id}")
async def obtener_evento(id: int, db: Session = Depends(get_db)):
    try:
        return await evento_por_entrada(id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/get-disponibles/{evento_id}", response_model=list[EntradaResponse])
def entradas_disponibles(evento_id: int, db: Session = Depends(get_db)):
    return obtener_disponibles(db, evento_id)

@router.get("/get-nodisponibles/{evento_id}", response_model=list[EntradaResponse])
def entradas_no_disponibles(evento_id: int, db: Session = Depends(get_db)):
    return obtener_no_disponibles(db, evento_id)


@router.put("/cancelar/{id}", response_model=EntradaResponse)
def cancelar_entrada(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        return cancelar_entrada_usuario(db, id, user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-todas", response_model=list[EntradaResponse])
def todas_entradas(db: Session = Depends(get_db), _: Depends = Depends(require_admin)):
    return obtener_todas_entradas(db)

@router.get("/get-por-evento/{evento_id}", response_model=list[EntradaResponse])
def entradas_por_evento(evento_id: int, db: Session = Depends(get_db)):
    return obtener_entradas_por_evento(db, evento_id)

@router.post("/comprar")
def comprar_multiple(request: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        evento_id = request.get("evento_id")
        entradas = request.get("entradas", [])
        return comprar_entradas_multiple(db, evento_id, entradas, user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/estadisticas-ventas")
def estadisticas_ventas(db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    """Obtener estadísticas de ventas de entradas"""
    try:
        return obtener_estadisticas_ventas(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")

@router.get("/get-canceladas", response_model=list[EntradaResponse])
def obtener_entradas_canceladas(
    evento_id: int = None,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Obtener entradas canceladas para administradores"""
    from app.repository.entrada_repository import get_entradas_canceladas
    return get_entradas_canceladas(db, evento_id)
