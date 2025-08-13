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

        print(f"🔧 Procesando evento - Tipo: {tipo}, Data: {data}")

        if not tipo or not data:
            print("⚠️ Evento inválido - falta tipo o payload")
            return

        # Manejar diferentes tipos de eventos
        if tipo == "notificacion":
            # Para notificaciones generales (como eventos publicados)
            dto = NotificacionCreateDTO(
                usuario_id=data.get("usuario_id"),  # None = broadcast
                titulo=data.get("tipo", "Notificación").capitalize(),
                mensaje=data["mensaje"],
                tipo="info"
            )
        elif tipo == "usuario_creado":
            # Para usuarios nuevos
            dto = NotificacionCreateDTO(
                usuario_id=data.get("usuario_id"),
                titulo=data.get("titulo", "Bienvenido"),
                mensaje=data.get("mensaje", "Te has registrado exitosamente"),
                tipo=data.get("tipo", "success")
            )
        elif tipo in ["entrada_comprada", "entrada_cancelada"]:
            # Para eventos de entradas
            dto = NotificacionCreateDTO(
                usuario_id=data.get("usuario_id"),
                titulo=data.get("titulo", "Entrada"),
                mensaje=data.get("mensaje", "Operación realizada"),
                tipo=data.get("tipo", "info")
            )
        else:
            print(f"⚠️ Tipo de evento desconocido: {tipo}")
            return
        
        print(f"🔧 DTO creado: {dto}")
        
        noti = crear_notificacion(db, dto)
        print(f"✅ Notificación creada en BD: ID={noti.id}, Usuario={noti.usuario_id}")

        # Intentar envío via WebSocket (opcional, no crítico)
        try:
            mensaje = f"[{dto.tipo.upper()}] {dto.mensaje}"
            loop = get_loop()
            if loop:
                if dto.usuario_id:
                    loop.call_soon_threadsafe(
                        lambda: asyncio.create_task(manager.send_to_user(dto.usuario_id, mensaje))
                    )
                else:
                    loop.call_soon_threadsafe(
                        lambda: asyncio.create_task(manager.broadcast_global(mensaje))
                    )
                print(f"🔔 WebSocket enviado para usuario: {dto.usuario_id}")
        except Exception as ws_error:
            print(f"⚠️ Error en WebSocket (no crítico): {ws_error}")

        print(f"✅ Notificación procesada completamente para usuario {dto.usuario_id}")
        return noti

    except Exception as e:
        print(f"❌ Error procesando evento: {e}")
        import traceback
        traceback.print_exc()
        raise

def handle_task_exception(task: asyncio.Task):
    try:
        task.result()
    except Exception as e:
        print("❌ Error en tarea async:", repr(e))
