from fastapi import FastAPI
from app.usuarios.routes import router as usuarios_router
from app.database import get_db, crear_usuarios_demo, engine
from app.base import Base 
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_400_BAD_REQUEST
from starlette.status import HTTP_401_UNAUTHORIZED
from fastapi.exceptions import HTTPException


app = FastAPI(title="Plataforma Encuentro - Microservicio Usuario",)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=HTTP_400_BAD_REQUEST,
        content={"detail": "Campos inválidos"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == HTTP_401_UNAUTHORIZED and exc.detail == "Not authenticated":
        return JSONResponse(
            status_code=HTTP_401_UNAUTHORIZED,
            content={"detail": "No autenticado"},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

Base.metadata.create_all(bind=engine)

crear_usuarios_demo()

app.include_router(usuarios_router, tags=["Usuarios"])
