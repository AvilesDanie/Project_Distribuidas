import pika
from app.config.settings import settings

def get_rabbit_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)

def publish_message(message: str):
    conn = get_rabbit_connection()
    channel = conn.channel()
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
    channel.basic_publish(exchange='', routing_key=settings.RABBITMQ_QUEUE, body=message)
    conn.close()
