from sqlalchemy.orm import Session
from app.model.evento_model import Evento
from app.dto.evento_dto import EventoCreateDTO, EventoUpdateDTO
import random
import time

def generar_id_seguro():
    """Genera un ID seguro que JavaScript puede manejar sin perder precisión"""
    # Usar timestamp en segundos (10 dígitos) + número aleatorio (3 dígitos) = 13 dígitos máximo
    # Esto está muy por debajo del límite de JavaScript (15-16 dígitos)
    timestamp = int(time.time())  # Segundos desde epoch (10 dígitos aprox)
    random_part = random.randint(100, 999)  # 3 dígitos
    return int(f"{timestamp}{random_part}")

def crear_evento(db: Session, evento: EventoCreateDTO):
    print(f"🔍 Creando nuevo evento: {evento.model_dump()}")
    
    # Generar ID seguro
    nuevo_id = generar_id_seguro()
    
    # Asegurarse de que el ID no existe (muy raro, pero por seguridad)
    while db.query(Evento).filter(Evento.id == nuevo_id).first():
        nuevo_id = generar_id_seguro()
    
    print(f"🔍 ID generado: {nuevo_id}")
    
    evento_data = evento.model_dump()
    evento_data['id'] = nuevo_id
    
    nuevo = Evento(**evento_data)
    print(f"🔍 Objeto evento creado, añadiendo a la BD...")
    db.add(nuevo)
    try:
        db.commit()
        db.refresh(nuevo)
        print(f"✅ Evento creado con ID: {nuevo.id}")
        return nuevo
    except Exception as e:
        print(f"❌ Error al crear evento: {e}")
        db.rollback()
        return None

def obtener_todos(db: Session):
    return db.query(Evento).filter(Evento.estado != "CANCELADO").all()

def obtener_publicados(db: Session):
    print(f"🔍 Buscando eventos publicados con estado 'PUBLICADO'")
    eventos = db.query(Evento).filter(Evento.estado == "PUBLICADO").all()
    print(f"✅ Eventos publicados encontrados: {len(eventos)}")
    for evento in eventos:
        print(f"   - {evento.titulo} (ID: {evento.id}, Estado: {evento.estado})")
    return eventos

def obtener_por_id(db: Session, id: int):
    print(f"🔍 Buscando evento con ID: {id}")
    evento = db.query(Evento).filter(Evento.id == id).first()
    if evento:
        print(f"✅ Evento encontrado: {evento.titulo} (ID: {evento.id})")
    else:
        print(f"❌ Evento con ID {id} no encontrado")
        # Vamos a ver qué eventos existen
        eventos_existentes = db.query(Evento).all()
        print(f"🔍 Eventos existentes: {[(e.id, e.titulo) for e in eventos_existentes]}")
    return evento

def actualizar_evento(db: Session, id: int, data: EventoUpdateDTO):
    print(f"🔍 Intentando actualizar evento con ID: {id}")
    print(f"🔍 Datos a actualizar: {data.model_dump(exclude_unset=True)}")
    
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        print(f"❌ Evento con ID {id} no encontrado")
        return None
    
    print(f"✅ Evento encontrado: {evento.titulo}")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        print(f"🔄 Actualizando {key}: {getattr(evento, key)} -> {value}")
        setattr(evento, key, value)
    
    try:
        db.commit()
        db.refresh(evento)
        print(f"✅ Evento actualizado exitosamente")
        return evento
    except Exception as e:
        print(f"❌ Error al actualizar evento: {e}")
        db.rollback()
        return None

def cambiar_estado(db: Session, id: int, nuevo_estado: str):
    print(f"🔄 Cambiando estado de evento {id} a: {nuevo_estado}")
    evento = db.query(Evento).filter(Evento.id == id).first()
    if not evento:
        print(f"❌ Evento {id} no encontrado para cambiar estado")
        return None
    
    print(f"🔄 Estado anterior: {evento.estado} -> nuevo: {nuevo_estado}")
    evento.estado = nuevo_estado
    
    try:
        db.commit()
        db.refresh(evento)
        print(f"✅ Estado cambiado exitosamente para evento {id}")
        return evento
    except Exception as e:
        print(f"❌ Error al cambiar estado: {e}")
        db.rollback()
        return None

def eliminar_evento(db: Session, id: int):
    evento = db.query(Evento).filter(Evento.id == id).first()
    if evento and evento.estado == "NO_PUBLICADO":
        db.delete(evento)
        db.commit()
        return True
    return False
