from sqlalchemy.orm import Session
from app.model.notificacion_model import Notificacion
from app.dto.notificacion_dto import NotificacionCreateDTO

def crear_notificacion(db: Session, data: NotificacionCreateDTO):
    noti = Notificacion(**data.dict())
    db.add(noti)
    db.commit()
    db.refresh(noti)
    return noti
