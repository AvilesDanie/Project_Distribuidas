from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.dto.evento_dto import (
    EventoCreate, EventoResponse, EventoUpdate
)
from app.service.evento_service import (
    crear_nuevo_evento, get_evento,
    get_eventos, update_evento, delete_evento
)

router = APIRouter(prefix="/api/v1/eventos", tags=["eventos"])

@router.post("/", response_model=EventoResponse)
def crear(evento: EventoCreate, db: Session = Depends(get_db)):
    return crear_nuevo_evento(db, evento)

@router.get("/", response_model=List[EventoResponse])
def listar(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1)
):
    return get_eventos(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=EventoResponse)
def leer(id: int, db: Session = Depends(get_db)):
    try:
        return get_evento(db, id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))

@router.put("/{id}", response_model=EventoResponse)
def actualizar(id: int, data: EventoUpdate, db: Session = Depends(get_db)):
    try:
        return update_evento(db, id, data)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))

@router.delete("/{id}", status_code=204)
def eliminar(id: int, db: Session = Depends(get_db)):
    try:
        delete_evento(db, id)
    except ValueError as e:
        raise HTTPException(404, detail=str(e))
