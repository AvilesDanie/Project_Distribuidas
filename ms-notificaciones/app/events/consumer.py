import json
from app.config.rabbitmq import get_channel
from app.config.database import SessionLocal
from app.dto.notificacion_dto import NotificacionCreateDTO
from app.service.notificacion_service import procesar_notificacion

def start_consumer():
    channel, connection = get_channel()

    def callback(ch, method, properties, body):
        print("📨 Mensaje recibido:", body)
        try:
            data = json.loads(body)
            tipo = data.get("event")
            mensaje = ""
            usuario_id = data.get("usuario_id")

            if tipo == "usuario_creado":
                mensaje = "Un nuevo administrador fue creado."
            elif tipo == "nuevo_evento":
                mensaje = f"Nuevo evento disponible: {data.get('nombre')}"
            elif tipo == "evento_finalizado":
                mensaje = f"El evento ha finalizado: {data.get('nombre')}"
            elif tipo == "compra_entrada":
                mensaje = f"Entrada comprada (ID: {data.get('entrada_id')}) por el usuario {usuario_id}"
            else:
                return  # Ignorar mensajes desconocidos

            db = SessionLocal()
            dto = NotificacionCreateDTO(tipo=tipo, mensaje=mensaje, usuario_id=usuario_id)
            procesar_notificacion(db, dto)
            db.close()
        except Exception as e:
            print(f"❌ Error procesando mensaje: {e}")

    channel.basic_consume(queue="notificaciones_queue", on_message_callback=callback, auto_ack=True)
    print(" [*] Esperando mensajes en RabbitMQ (notificaciones)...")
    channel.start_consuming()
