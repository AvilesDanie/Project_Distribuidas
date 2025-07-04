import pika
from app.config.settings import settings

def publish_message(message: str):
    params = pika.URLParameters(settings.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)
    channel.basic_publish(exchange='', routing_key=settings.RABBITMQ_QUEUE, body=message)
    connection.close()
