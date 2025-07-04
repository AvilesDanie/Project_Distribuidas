from sqlalchemy.orm import Session
from app.model.usuario_model import Usuario, EstadoEnum

def create_usuario(db: Session, usuario_data):
    db_user = Usuario(**usuario_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_usuario_por_id(db: Session, user_id: int):
    return db.query(Usuario).filter(Usuario.id == user_id).first()

def get_usuario_por_id_estado(db: Session, user_id: int):
    return db.query(Usuario).filter(
        Usuario.id == user_id,
        Usuario.estado == EstadoEnum.activo
    ).first()

def get_usuario_por_nombre(db: Session, username: str):
    return db.query(Usuario).filter(
        Usuario.usuario == username,
        Usuario.estado == EstadoEnum.activo
    ).first()

def get_usuarios(db: Session, filtro: str = ""):
    return db.query(Usuario).filter(
        Usuario.estado == EstadoEnum.activo
    ).filter(
        (Usuario.usuario.contains(filtro)) |
        (Usuario.email.contains(filtro))
    ).all()

def update_usuario(db: Session, user: Usuario, datos):
    for key, value in datos.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def deactivate_usuario(db: Session, user: Usuario):
    user.estado = EstadoEnum.desactivado
    db.commit()
