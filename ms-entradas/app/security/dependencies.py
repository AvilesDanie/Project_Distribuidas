from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.security.auth import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return data

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Acceso restringido a administradores")
    return user
