import pika, json
from app.config.database import SessionLocal
from app.listener.evento_listener import cancelar_entradas_evento, procesar_evento_creado
from app.config.settings import settings
from app.model.entrada_model import Entrada
from uuid import uuid4

def start_listener():
    # Conectarse a RabbitMQ
    connection = pika.BlockingConnection(pika.URLParameters(settings.RABBITMQ_URL))
    channel = connection.channel()

    # Declarar la cola del listener
    channel.queue_declare(queue=settings.RABBITMQ_LISTENER_QUEUE, durable=True)

    def callback(ch, method, properties, body):
        print("📥 Evento recibido:", body)
        try:
            data = json.loads(body)
            tipo = data.get("tipo")
            payload = data.get("payload")

            db = SessionLocal()

            if tipo == "evento_publicado":
                evento_id = payload["evento_id"]
                aforo = payload["aforo"]
                nombre = payload["nombre"]
                precio = payload["precio"]

                print(f"🎫 Generando {aforo} entradas para evento {evento_id}")
                for _ in range(aforo):
                    entrada = Entrada(
                        codigo=str(uuid4()),
                        evento_id=evento_id,
                        evento_nombre=nombre,
                        precio=precio
                    )
                    db.add(entrada)

                db.commit()
                print(f"✅ Entradas creadas para evento {evento_id}")

            elif tipo == "evento_cancelado":
                evento_id = payload["evento_id"]
                db.query(Entrada).filter(Entrada.evento_id == evento_id).delete()
                db.commit()
                print(f"❌ Entradas eliminadas para evento cancelado {evento_id}")

            db.close()

        except SQLAlchemyError as db_error:
            print("❌ Error de base de datos:", str(db_error))
        except Exception as e:
            print("❌ Error procesando evento:", str(e))

    # Escuchar la cola
    channel.basic_consume(
        queue=settings.RABBITMQ_LISTENER_QUEUE,
        on_message_callback=callback,
        auto_ack=True
    )

    print(f"🔄 Escuchando en cola: {settings.RABBITMQ_LISTENER_QUEUE}")
    channel.start_consuming()
