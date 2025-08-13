from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.dto.evento_dto import EventoCreateDTO, EventoUpdateDTO, EventoOutDTO
from app.service import evento_service
from app.security.dependencies import get_current_user, require_admin
from typing import List
import httpx
import os
import uuid
from pathlib import Path

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
    evento = evento_service.publicar_evento(db, id)
    if not evento:
        raise HTTPException(status_code=400, detail="No se puede publicar: el evento no existe o no está en estado NO_PUBLICADO")
    return {"message": "Evento publicado exitosamente", "evento": evento}

@router.put("/terminar-evento/{id}")
def terminar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    return evento_service.finalizar_evento(db, id)

@router.delete("/delete-evento/{id}")
def eliminar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    resultado = evento_service.eliminar_evento(db, id)
    if not resultado:
        raise HTTPException(status_code=400, detail="No se puede eliminar: el evento no existe o ya está publicado")
    return {"message": "Evento eliminado exitosamente"}

@router.get("/get-categorias", response_model=List[str])
def obtener_categorias(db: Session = Depends(get_db)):
    return evento_service.obtener_categorias(db)


@router.put("/cancelar-evento/{id}")
def cancelar(id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    evento = evento_service.cancelar_evento(db, id)
    if not evento:
        raise HTTPException(status_code=400, detail="No se puede cancelar: el evento no existe")
    return evento


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
def obtener_estadisticas(db: Session = Depends(get_db)):
    """Endpoint para obtener estadísticas de eventos"""
    return evento_service.obtener_estadisticas_eventos(db)

@router.get("/ventas")
def ventas_por_evento(evento_id: int = None, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    """Obtener estadísticas de ventas de un evento específico o general"""
    try:
        # Si se proporciona evento_id, obtener ventas de ese evento específico
        if evento_id:
            response = httpx.get(
                f"http://entradas:8000/entradas/get-nodisponibles/{evento_id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return {"evento_id": evento_id, "entradas_vendidas": len(response.json())}
            else:
                raise HTTPException(status_code=response.status_code, detail="Error al consultar entradas")
        else:
            # Si no se proporciona evento_id, obtener estadísticas generales
            response = httpx.get(
                "http://entradas:8000/entradas/estadisticas-ventas",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Error al consultar entradas")

    except httpx.RequestError as e:
        print("EXCEPTION:", str(e))
        raise HTTPException(status_code=503, detail="Servicio de entradas no disponible")

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Endpoint para subir imágenes de eventos"""
    try:
        # Validar tipo de archivo
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Crear directorio si no existe
        upload_dir = Path("uploads/images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generar nombre único para el archivo
        file_extension = file.filename.split('.')[-1] if file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Retornar URL de la imagen
        image_url = f"/uploads/images/{unique_filename}"
        return {"image_url": image_url, "filename": unique_filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

@router.get("/image/{filename}")
async def get_image(filename: str):
    """Endpoint para obtener imágenes de eventos"""
    try:
        # Verificar que el archivo existe
        file_path = Path("uploads/images") / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        
        # Determinar el tipo de contenido basado en la extensión
        file_extension = filename.split('.')[-1].lower()
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        
        content_type = content_types.get(file_extension, 'image/jpeg')
        
        # Leer y retornar el archivo
        with open(file_path, "rb") as buffer:
            return Response(content=buffer.read(), media_type=content_type)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener imagen: {str(e)}")