from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.config.settings import settings

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
