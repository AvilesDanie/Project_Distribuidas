# usuarios/auth.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

ALGORITMO = "HS256"
CLAVE_SECRETA = "CLAVE_SUPER_SECRETA"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verificar_password(password_plano: str, password_hash: str):
    return pwd_context.verify(password_plano, password_hash)

def crear_token(data: dict, expiracion_min=60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expiracion_min)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, CLAVE_SECRETA, algorithm=ALGORITMO)

def verificar_token(token: str):
    try:
        return jwt.decode(token, CLAVE_SECRETA, algorithms=[ALGORITMO])
    except:
        return None
