import pika
import json
from app.config.settings import settings
from app.config.database import SessionLocal
from app.service.notificacion_service import procesar_evento_rabbit

def start_listener():
    try:
        # Establecer conexión con RabbitMQ
        connection = pika.BlockingConnection(pika.URLParameters(settings.RABBITMQ_URL))
        channel = connection.channel()

        # Asegurar que la cola esté declarada
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
        print(f"🔄 Escuchando en cola: {settings.RABBITMQ_QUEUE}")

        # Función que se llama al recibir un mensaje
        def callback(ch, method, properties, body):
            print("📥 Evento recibido:", body)
            try:
                payload = json.loads(body)
                db = SessionLocal()
                procesar_evento_rabbit(db, payload)
                db.close()
            except Exception as e:
                print("❌ Error al procesar el evento:", e)

        # Iniciar el consumo de mensajes
        channel.basic_consume(
            queue=settings.RABBITMQ_QUEUE,
            on_message_callback=callback,
            auto_ack=True
        )

        channel.start_consuming()

    except pika.exceptions.AMQPConnectionError as e:
        print("❌ Error de conexión con RabbitMQ:", e)
