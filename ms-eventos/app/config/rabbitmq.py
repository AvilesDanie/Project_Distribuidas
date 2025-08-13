import pika
from app.config.settings import settings
from typing import Iterable, Tuple

DEFAULT_QUEUES: Tuple[str, str] = ("notificaciones_queue", "entradas_events")

def _open_channel():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    params.heartbeat = 30
    params.blocked_connection_timeout = 15
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    return connection, channel

def publish_message(message: str, queues: Iterable[str] = DEFAULT_QUEUES) -> None:
    """
    Publica el mismo mensaje en múltiples colas (por defecto: notificaciones_queue y entradas_events).
    Recibe str (tú ya haces json.dumps en el publisher).
    """
    connection = None
    try:
        connection, channel = _open_channel()
        body = message if isinstance(message, (bytes, bytearray)) else message.encode("utf-8")

        for queue_name in queues:
            channel.queue_declare(queue=queue_name, durable=True)
            channel.basic_publish(
                exchange="",
                routing_key=queue_name,
                body=body,
                properties=pika.BasicProperties(delivery_mode=2),  # persistente
            )
            print(f"[RabbitMQ] 📤 Mensaje enviado a '{queue_name}'")

    finally:
        try:
            if connection and connection.is_open:
                connection.close()
        except Exception:
            pass

def publish_to_notifications_only(message: str) -> None:
    """Atajo: sólo a notificaciones."""
    publish_message(message, queues=("notificaciones_queue",))
