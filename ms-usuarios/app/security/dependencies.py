from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.security.auth import verify_token
from app.model.usuario_model import Usuario, RolEnum
from app.repository.usuario_repository import get_usuario_por_id_estado

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/usuarios/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user = get_usuario_por_id_estado(db, data.get("id"))
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o desactivado")
    return user

def require_admin(user: Usuario = Depends(get_current_user)):
    if user.rol != RolEnum.administrador:
        raise HTTPException(status_code=403, detail="Acceso permitido solo para administradores")
    return user
