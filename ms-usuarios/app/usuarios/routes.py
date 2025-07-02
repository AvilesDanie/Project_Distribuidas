from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from . import models, auth
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from jose import JWTError
from app.entradas.models import Entrada
from app.eventos.models import Evento


router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/usuarios/login")


def get_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    data = auth.verificar_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Token inválido")
    return db.query(models.Usuario).filter(models.Usuario.id == data["id"], models.Usuario.estado == "activo").first()


def es_admin(usuario: models.Usuario):
    if not usuario or usuario.rol != "administrador":
        raise HTTPException(status_code=403, detail="Solo administradores pueden acceder.")


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=400, detail="Formato inválido o campos faltantes")

    usuario = db.query(models.Usuario).filter(models.Usuario.usuario == form_data.username).first()
    if not usuario or not auth.verificar_password(form_data.password, usuario.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = auth.crear_token({"id": usuario.id, "rol": usuario.rol})
    return {"access_token": token, "token_type": "bearer"}



@router.post("/registro", response_model=schemas.UsuarioResponse, status_code=201)
def registrar(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == usuario.email, models.Usuario.estado == "activo").first():
        raise HTTPException(status_code=409, detail="Correo ya registrado.")
    if db.query(models.Usuario).filter(models.Usuario.usuario == usuario.usuario, models.Usuario.estado == "activo").first():
        raise HTTPException(status_code=409, detail="Usuario ya registrado.")
    nuevo = models.Usuario(
        usuario=usuario.usuario,
        email=usuario.email,
        password=auth.hash_password(usuario.password)
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.post("/crear-admin", response_model=schemas.UsuarioResponse)
def crear_admin(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db), actual: models.Usuario = Depends(get_usuario_actual)):
    if actual.rol != "administrador":
        raise HTTPException(status_code=403, detail="No autorizado.")
    if db.query(models.Usuario).filter(models.Usuario.email == usuario.email, models.Usuario.estado == "activo").first():
        raise HTTPException(status_code=409, detail="Correo ya registrado.")
    if db.query(models.Usuario).filter(models.Usuario.usuario == usuario.usuario, models.Usuario.estado == "activo").first():
        raise HTTPException(status_code=409, detail="Usuario ya registrado.")
    nuevo = models.Usuario(
        usuario=usuario.usuario,
        email=usuario.email,
        password=auth.hash_password(usuario.password),
        rol="administrador"
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/get-usuarios", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(
    filtro: str = "",
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(get_usuario_actual)
):
    es_admin(actual)
    return db.query(models.Usuario).filter(
        models.Usuario.estado == "activo"
    ).filter(
        (models.Usuario.usuario.contains(filtro)) |
        (models.Usuario.email.contains(filtro))
    ).all()


@router.get("/get-usuario/{id}", response_model=schemas.UsuarioResponse)
def obtener_usuario(
    id: int,
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(get_usuario_actual)
):
    es_admin(actual)
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="No encontrado")
    return usuario


@router.get("/get-mi-perfil", response_model=schemas.UsuarioResponse)
def perfil(actual: models.Usuario = Depends(get_usuario_actual)):
    return actual

@router.put("/update-usuarios/{id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(
    id: int,
    datos: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(get_usuario_actual)
):
    if actual.id != id:
        raise HTTPException(status_code=403, detail="No puedes editar a otro usuario")
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="No encontrado")
    for campo, valor in datos.dict(exclude_unset=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario

@router.put("/update-password/{id}")
def actualizar_password(
    id: int,
    datos: schemas.PasswordUpdate,
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(get_usuario_actual)
):
    if actual.id != id:
        raise HTTPException(status_code=403, detail="No puedes cambiar la contraseña de otro usuario")
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="No encontrado")
    if not auth.verificar_password(datos.actual, usuario.password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta.")
    usuario.password = auth.hash_password(datos.nueva)
    db.commit()
    return {"mensaje": "Contraseña actualizada"}

@router.delete("/delete-usuario/{id}", status_code=204)
def eliminar_usuario(
    id: int,
    db: Session = Depends(get_db),
    actual: models.Usuario = Depends(get_usuario_actual)
):
    es_admin(actual)
    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="No encontrado")
    usuario.estado = "desactivado"
    db.commit()






@router.get("/mis-entradas", response_model=List[schemas.EntradaResponse])
def mis_entradas(actual: models.Usuario = Depends(get_usuario_actual), db: Session = Depends(get_db)):
    return db.query(Entrada).filter(Entrada.usuario_id == actual.id).all()

@router.get("/historial-usuario/{id}", response_model=List[schemas.EntradaResponse])
def historial_usuario(id: int, actual: models.Usuario = Depends(get_usuario_actual), db: Session = Depends(get_db)):
    if actual.rol != "administrador":
        raise HTTPException(status_code=403, detail="Solo administradores")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return db.query(Entrada).filter(Entrada.usuario_id == id).all()