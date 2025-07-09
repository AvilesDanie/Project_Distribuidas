from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.dto.evento_dto import EventoCreateDTO, EventoUpdateDTO, EventoOutDTO
from app.service import evento_service
from app.security.dependencies import get_current_user, require_admin
from typing import List
import httpx

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/post-evento", response_model=EventoOutDTO)
def crear(dto: EventoCreateDTO, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.crear_evento(db, dto)

@router.get("/get-eventospublicados", response_model=List[EventoOutDTO])
def publicados(db: Session = Depends(get_db)):
    return evento_service.listar_publicados(db)

@router.get("/get-eventos", response_model=List[EventoOutDTO])
def todos(db: Session = Depends(get_db)):
    return evento_service.listar_todos(db)

@router.get("/get-eventopublicado/{id}", response_model=EventoOutDTO)
def publicado(id: int, db: Session = Depends(get_db)):
    evento = evento_service.obtener_evento(db, id)
    if evento and evento.estado == "PUBLICADO":
        return evento
    raise HTTPException(404, "Evento no encontrado")

@router.get("/get-evento/{id}", response_model=EventoOutDTO)
def obtener(id: int, db: Session = Depends(get_db)):
    evento = evento_service.obtener_evento(db, id)
    if not evento:
        raise HTTPException(404, "Evento no encontrado")
    return evento

@router.put("/update-evento/{id}", response_model=EventoOutDTO)
def actualizar(id: int, dto: EventoUpdateDTO, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.actualizar_evento(db, id, dto)

@router.put("/desactivar-evento/{id}")
def desactivar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.desactivar_evento(db, id)

@router.put("/publicar-evento/{id}")
def publicar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.publicar_evento(db, id)

@router.put("/terminar-evento/{id}")
def terminar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.finalizar_evento(db, id)

@router.delete("/delete-evento/{id}")
def eliminar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.eliminar_evento(db, id)

@router.get("/get-categorias", response_model=List[str])
def obtener_categorias(db: Session = Depends(get_db)):
    return evento_service.obtener_categorias(db)


@router.get("/buscar-eventos", response_model=List[EventoOutDTO])
def buscar_eventos(
    categoria: str = "",
    tipo: str = "",
    fecha: str = "",
    palabra: str = "",
    db: Session = Depends(get_db)
):
    return evento_service.buscar_eventos(db, categoria, tipo, fecha, palabra)

@router.get("/estadisticas")
def estadisticas(db: Session = Depends(get_db)):
    return evento_service.obtener_estadisticas(db)

@router.get("/ventas")
def ventas_por_evento(evento_id: int, request: Request):
    try:
        token = request.headers.get("authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Token faltante")

        response = httpx.get(
            f"http://nginx/api/v1/entradas/entradas/get-nodisponibles/{evento_id}",
            headers={"Authorization": token}
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        if response.status_code == 200:
            return {"evento_id": evento_id, "entradas_vendidas": len(response.json())}
        else:
            raise HTTPException(status_code=response.status_code, detail="Error al consultar entradas")

    except httpx.RequestError as e:
        print("EXCEPTION:", str(e))
        raise HTTPException(status_code=503, detail="Servicio de entradas no disponible")