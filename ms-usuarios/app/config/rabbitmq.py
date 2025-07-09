import pika
from app.config.settings import settings

def publish_message(message: str, queue_name: str = None):
    """
    Publica un mensaje en RabbitMQ.
    Si no se especifica `queue_name`, usará la cola por defecto RABBITMQ_QUEUE.
    """
    queue = queue_name or settings.RABBITMQ_QUEUE
    params = pika.URLParameters(settings.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue=queue, durable=True)
    channel.basic_publish(
        exchange='',
        routing_key=queue,
        body=message
    )

    print(f"📤 Mensaje enviado a RabbitMQ ({queue}):", message)
    connection.close()
