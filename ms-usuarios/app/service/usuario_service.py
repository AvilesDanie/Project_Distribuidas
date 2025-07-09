from sqlalchemy.orm import Session
from app.dto.usuario_dto import UsuarioCreate, UsuarioUpdate, PasswordUpdate, UsuarioResponse
from app.repository.usuario_repository import (
    create_usuario, get_usuario_por_email, get_usuario_por_nombre, get_usuario_por_id, get_usuarios,
    update_usuario, deactivate_usuario
)
from app.security.auth import hash_password, verify_password
from app.events.publisher import publish_user_created

def register_user(db: Session, data: UsuarioCreate):
    if get_usuario_por_nombre(db, data.usuario):
        raise ValueError("El nombre de usuario ya existe")
    if get_usuario_por_email(db, data.email):
        raise ValueError("El correo ya está registrado")
    if len(data.password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")  # ✅ Validación añadida
    user_dict = data.dict()
    user_dict["password"] = hash_password(data.password)
    new_user = create_usuario(db, user_dict)
    publish_user_created(new_user.id)
    return new_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_usuario_por_nombre(db, username)
    if not user or not verify_password(password, user.password):
        return None
    return user

def list_users(db: Session, filtro: str = ""):
    return get_usuarios(db, filtro)

def modify_user(db: Session, user_id: int, datos: UsuarioUpdate, current_user):
    if current_user.id != user_id:
        raise PermissionError("No puedes editar otro usuario")
    user = get_usuario_por_id(db, user_id)
    if not user:
        raise LookupError("Usuario no encontrado")
    return update_usuario(db, user, datos.dict(exclude_unset=True))

def change_password(db: Session, user_id: int, datos: PasswordUpdate, current_user):
    if current_user.id != user_id:
        raise PermissionError("No autorizado para cambiar esta contraseña")
    user = get_usuario_por_id(db, user_id)
    if not user:
        raise LookupError("Usuario no encontrado")
    if not verify_password(datos.actual, user.password):
        raise ValueError("Contraseña actual incorrecta")
    return update_usuario(db, user, {"password": hash_password(datos.nueva)})

def delete_user(db: Session, user_id: int):
    user = get_usuario_por_id(db, user_id)
    if not user:
        raise LookupError("Usuario no encontrado")
    deactivate_usuario(db, user)
