import pika
from app.config.settings import settings

def publish_message(message: str):
    params = pika.URLParameters(settings.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue="entradas_events", durable=True)  # 🔥 Hardcoded por ahora para asegurar
    channel.basic_publish(exchange='', routing_key="entradas_events", body=message)
    print("📤 Mensaje enviado a RabbitMQ:", message)
    connection.close()
