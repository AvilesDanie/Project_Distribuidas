import json
from app.config.rabbitmq import get_channel
from app.config.database import SessionLocal
from app.dto.notificacion_dto import NotificacionCreateDTO
from app.service.notificacion_service import procesar_evento_rabbit

def start_consumer():
    channel, connection = get_channel()

    def callback(ch, method, properties, body):
        print("📨 Mensaje recibido:", body)
        try:
            data = json.loads(body)
            tipo = data.get("tipo")  # Usar 'tipo' en lugar de 'event'
            payload = data.get("payload", {})
            
            print(f"🔍 Procesando evento tipo: {tipo}")
            
            if tipo == "notificacion":
                print("� Procesando notificación")
                # Usar el payload directamente
                db = SessionLocal()
                procesar_evento_rabbit(db, data)
                db.close()
                print(f"✅ Notificación procesada correctamente")
            elif tipo == "evento_publicado":
                print("🎫 Procesando evento publicado para notificación")
                # Convertir evento_publicado a notificación broadcast
                evento_data = data.get("payload", {})
                notification_data = {
                    "tipo": "notificacion",
                    "payload": {
                        "tipo": "info",
                        "mensaje": f"¡Nuevo evento disponible: {evento_data.get('nombre')}! Precio: ${evento_data.get('precio')}",
                        "usuario_id": None  # Broadcast
                    }
                }
                db = SessionLocal()
                procesar_evento_rabbit(db, notification_data)
                db.close()
            elif tipo == "usuario_creado":
                print("👤 Procesando usuario creado")
                db = SessionLocal()
                procesar_evento_rabbit(db, data)
                db.close()
            elif tipo == "entrada_comprada":
                print("🛒 Procesando compra de entrada")
                db = SessionLocal()
                procesar_evento_rabbit(db, data)
                db.close()
            elif tipo == "entrada_cancelada":
                print("❌ Procesando cancelación de entrada")
                db = SessionLocal()
                procesar_evento_rabbit(db, data)
                db.close()
            else:
                print(f"⚠️ Tipo de evento desconocido: {tipo}")
                return
            
        except Exception as e:
            print(f"❌ Error procesando mensaje: {e}")

    channel.basic_consume(queue="notificaciones_queue", on_message_callback=callback, auto_ack=True)
    print("🔄 Esperando mensajes en RabbitMQ (notificaciones_queue)...")
    channel.start_consuming()
