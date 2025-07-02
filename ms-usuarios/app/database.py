# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.base import Base  # ✅ Aquí importas desde base.py
from app.usuarios import models as usuario_models
from sqlalchemy.orm import Session
from app.usuarios.auth import hash_password

DATABASE_URL = "postgresql://postgres:taco@localhost:5432/encuentro_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




def crear_usuarios_demo():
    db = SessionLocal()
    try:
        # Usuario normal
        if not db.query(usuario_models.Usuario).filter(usuario_models.Usuario.usuario == "usuario_demo").first():
            demo = usuario_models.Usuario(
                usuario="usuario_demo",
                email="usuario@demo.com",
                password=hash_password("usuario123"),
                rol="usuario"
            )
            db.add(demo)

        # Usuario administrador
        if not db.query(usuario_models.Usuario).filter(usuario_models.Usuario.usuario == "admin_demo").first():
            admin = usuario_models.Usuario(
                usuario="admin_demo",
                email="admin@demo.com",
                password=hash_password("admin123"),
                rol="administrador"
            )
            db.add(admin)

        db.commit()
    finally:
        db.close()
