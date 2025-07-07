from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dto.evento_dto import EventoCreate, EventoResponse
from app.service.evento_service import crear_nuevo_evento, get_evento, get_eventos

router = APIRouter()

@router.post("/", response_model=EventoResponse)
def crear(evento: EventoCreate, db: Session = Depends(get_db)):
    return crear_nuevo_evento(db, evento)

@router.get("/{id}", response_model=EventoResponse)
def leer(id: int, db: Session = Depends(get_db)):
    try:
        return get_evento(id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=list[EventoResponse])
def listar(db: Session = Depends(get_db)):
    return get_eventos(db)
