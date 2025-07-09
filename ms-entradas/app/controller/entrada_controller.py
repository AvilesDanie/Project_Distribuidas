from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dto.entrada_dto import EntradaResponse
from app.security.dependencies import get_current_user, require_admin
from app.service.entrada_service import (
    comprar_entrada,
    obtener_mis_entradas,
    historial_usuario,
    evento_por_entrada,
    obtener_disponibles,
    obtener_no_disponibles
)

router = APIRouter()

@router.put("/comprar-entrada/{id}", response_model=EntradaResponse)
def comprar(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        return comprar_entrada(db, id, user["id"])
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
