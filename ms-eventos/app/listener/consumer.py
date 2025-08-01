import pika
from app.config.settings import settings

def start_consumer():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

    def callback(ch, method, properties, body):
        print(f"Mensaje recibido: {body}")

    channel.basic_consume(queue=settings.RABBITMQ_QUEUE, on_message_callback=callback, auto_ack=True)
    print("Esperando mensajes...")
    channel.start_consuming()
