from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import httpx
from app.repository.usuario_repository import get_usuario_por_nombre, get_usuario_por_email


from app.config.database import get_db
from app.events.publisher import publish_user_created
from app.dto.usuario_dto import (
    UsuarioCreate, UsuarioResponse, UsuarioUpdate, PasswordUpdate
)
from app.dto.auth_dto import TokenResponse
from app.security.auth import create_token, hash_password
from app.security.dependencies import get_current_user, require_admin
from app.service.usuario_service import (
    register_user, authenticate_user, list_users,
    modify_user, change_password, delete_user
)
from app.service.usuario_service import create_usuario

router = APIRouter()

# ✅ Login con OAuth2PasswordRequestForm (evita errores con Pydantic v2)
@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_token({"id": user.id, "rol": user.rol.value})
    return {"access_token": token, "token_type": "bearer"}

# Registro de usuario
@router.post("/registro", response_model=UsuarioResponse, status_code=201)
def registro(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    try:
        new_user = register_user(db, usuario)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return new_user

# Crear admin (requiere token y rol admin)
@router.post("/crear-admin", response_model=UsuarioResponse)
def crear_admin(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Depends = Depends(require_admin)
):
    try:
        # Validaciones explícitas
        if get_usuario_por_nombre(db, usuario.usuario):
            raise ValueError("El nombre de usuario ya existe")
        if get_usuario_por_email(db, usuario.email):
            raise ValueError("El correo ya está registrado")
        if len(usuario.password) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")

        user_dict = usuario.dict()
        user_dict["rol"] = "administrador"
        user_dict["password"] = hash_password(user_dict["password"])
        new_admin = create_usuario(db, user_dict)
        publish_user_created(new_admin.id)
        return new_admin

    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

# Listado de usuarios (solo admin)
@router.get("/get-usuarios", response_model=list[UsuarioResponse])
def get_usuarios_endpoint(
    filtro: str = "",
    db: Session = Depends(get_db),
    _: Depends = Depends(require_admin)
):
    return list_users(db, filtro)

# Obtener usuario por ID (solo admin)
@router.get("/get-usuario/{id}", response_model=UsuarioResponse)
def get_usuario(id: int, db: Session = Depends(get_db), _: Depends = Depends(require_admin)):
    users = list_users(db)
    for u in users:
        if u.id == id:
            return u
    raise HTTPException(status_code=404, detail="Usuario no encontrado")

# Obtener perfil del usuario autenticado
@router.get("/get-mi-perfil", response_model=UsuarioResponse)
def get_mi_perfil(current_user=Depends(get_current_user)):
    return current_user

# Actualizar datos del usuario autenticado
@router.put("/update-usuarios/{id}", response_model=UsuarioResponse)
def update_usuario_endpoint(
    id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        updated = modify_user(db, id, datos, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return updated

# Cambiar contraseña del usuario autenticado
@router.put("/update-password/{id}")
def update_password_endpoint(
    id: int,
    datos: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        change_password(db, id, datos, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"mensaje": "Contraseña actualizada correctamente"}

# Eliminar usuario (solo admin)
@router.delete("/delete-usuario/{id}", status_code=204)
def delete_usuario_endpoint(
    id: int,
    db: Session = Depends(get_db),
    _: Depends = Depends(require_admin)
):
    try:
        delete_user(db, id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
