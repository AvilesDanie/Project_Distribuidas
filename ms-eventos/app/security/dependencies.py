from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.security.auth import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return user
