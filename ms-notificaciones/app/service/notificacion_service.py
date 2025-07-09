import asyncio
from sqlalchemy.orm import Session
from app.dto.notificacion_dto import NotificacionCreateDTO
from app.repository.notificacion_repository import crear_notificacion
from app.websocket_manager import manager
from app.event_loop_context import get_loop

async def procesar_notificacion(db: Session, dto: NotificacionCreateDTO):
    noti = crear_notificacion(db, dto)
    mensaje = f"[{noti.tipo.upper()}] {noti.mensaje}"

    try:
        if noti.usuario_id:
            await manager.send_to_user(noti.usuario_id, mensaje)
        else:
            await manager.broadcast_global(mensaje)
    except Exception:
        import traceback
        traceback.print_exc()
        print("❌ Error procesando notificación.")

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

        loop = get_loop()
        if loop is None:
            print("❌ No se pudo capturar el loop principal.")
            return

        # Programar tarea asíncrona en el loop principal
        if dto.usuario_id:
            loop.call_soon_threadsafe(
                lambda: asyncio.create_task(manager.send_to_user(dto.usuario_id, mensaje))
            )
        else:
            loop.call_soon_threadsafe(
                lambda: asyncio.create_task(manager.broadcast_global(mensaje))
            )

        print(f"✅ Notificación procesada vía evento: {dto}")

    except Exception as e:
        print("❌ Error procesando evento:", e)

def handle_task_exception(task: asyncio.Task):
    try:
        task.result()
    except Exception as e:
        print("❌ Error en tarea async:", repr(e))
