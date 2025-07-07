from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.config.database import engine, Base, SessionLocal
from app.controller.usuario_controller import router as usuario_router
from app.model.usuario_model import Usuario, RolEnum, EstadoEnum
from app.security.auth import hash_password
from sqlalchemy.exc import IntegrityError

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    root_path="/api/v1/usuarios"
)

# CORS (ajusta orígenes según necesites)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router, prefix="/usuarios", tags=["Usuarios"])


@app.on_event("startup")
def startup_populate_admin():
    db: Session = SessionLocal()
    try:
        # Verificar si el admin ya existe
        existing_admin = db.query(Usuario).filter(Usuario.usuario == "admin").first()
        if not existing_admin:
            # Crear usuario admin por defecto
            admin = Usuario(
                usuario="admin",
                email="admin@example.com",
                password=hash_password("admin123"),
                rol=RolEnum.administrador,
                estado=EstadoEnum.activo
            )
            db.add(admin)
            db.commit()
            print("✅ Usuario admin creado automáticamente.")
        else:
            print("ℹ️ Usuario admin ya existe, no se crea uno nuevo.")
    except IntegrityError as e:
        db.rollback()
        print("❌ Error al insertar el admin:", e)
    finally:
        db.close()