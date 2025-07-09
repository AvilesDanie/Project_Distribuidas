import pika, json
from app.config.database import SessionLocal
from app.listener.evento_listener import procesar_evento_creado
from app.config.settings import settings

def start_listener():
    # Conectarse a RabbitMQ
    connection = pika.BlockingConnection(pika.URLParameters(settings.RABBITMQ_URL))
    channel = connection.channel()

    # Declarar la cola desde .env
    channel.queue_declare(queue=settings.RABBITMQ_LISTENER_QUEUE, durable=True)

    # ✅ Definir el callback antes de usarlo
    def callback(ch, method, properties, body):
        print("📥 Evento recibido:", body)
        try:
            data = json.loads(body)
            tipo = data.get("tipo")
            payload = data.get("payload")

            db = SessionLocal()
            if tipo == "nuevo_evento":
                procesar_evento_creado(payload, db)
            db.close()
        except Exception as e:
            print("❌ Error procesando evento:", str(e))

    # Iniciar consumo con callback definido
    channel.basic_consume(
        queue=settings.RABBITMQ_LISTENER_QUEUE,
        on_message_callback=callback,
        auto_ack=True
    )

    print(f"🔄 Escuchando en cola: {settings.RABBITMQ_LISTENER_QUEUE}")
    channel.start_consuming()
