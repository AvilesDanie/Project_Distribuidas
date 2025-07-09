import asyncio
from sqlalchemy.orm import Session
from app.dto.notificacion_dto import NotificacionCreateDTO
from app.repository.notificacion_repository import crear_notificacion
from app.websocket_manager import manager

#manager = WebSocketManager()  # instanciado aquí y usado por main también

async def procesar_notificacion(db: Session, dto: NotificacionCreateDTO):
    noti = crear_notificacion(db, dto)
    mensaje = f"[{noti.tipo.upper()}] {noti.mensaje}"

    # Notificación individual o global
    if noti.usuario_id:
        await manager.send_to_user(noti.usuario_id, mensaje)
    else:
        await manager.broadcast_global(mensaje)

    return noti

def procesar_evento_rabbit(db: Session, payload: dict):
    try:
        tipo = payload.get("tipo")
        data = payload.get("payload")

        if not tipo or not data:
            print("⚠️ Evento inválido")
            return

        dto = NotificacionCreateDTO(**data)
        noti = crear_notificacion(db, dto)

        mensaje = f"[{dto.tipo.upper()}] {dto.mensaje}"

        # WebSocket en segundo plano
        if dto.usuario_id:
            asyncio.create_task(manager.send_to_user(dto.usuario_id, mensaje))
        else:
            asyncio.create_task(manager.broadcast_global(mensaje))

        print(f"✅ Notificación procesada vía evento: {dto}")

    except Exception as e:
        print("❌ Error procesando evento:", e)