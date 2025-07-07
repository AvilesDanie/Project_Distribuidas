# app/listener/consumer.py

import json
import logging
import pika
from app.config.settings import settings
from app.config.rabbitmq import get_rabbit_connection
from app.service.evento_service import (
    # Ejemplo de manejadores de eventos, define estas funciones en tu servicio si las necesitas
    handle_usuario_eliminado,
    handle_entrada_creada,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def callback(ch, method, properties, body):
    """
    Callback que se ejecuta al recibir un mensaje del queue de RabbitMQ.
    Deserializa el evento y despacha al manejador correspondiente.
    """
    try:
        event = json.loads(body)
        event_type = event.get("event")
        logger.info(f"Recibido evento: {event_type} → {event}")

        if event_type == "usuario_eliminado":
            handle_usuario_eliminado(event["usuario_id"])
        elif event_type == "entrada_creada":
            handle_entrada_creada(event["entrada_id"])
        else:
            logger.warning(f"Evento no reconocido: {event_type}")

        # Acknowledge exitoso
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error("Error procesando mensaje", exc_info=e)
        # NACK sin requeue para evitar bucles infinitos sobre mensajes fallidos
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    """
    Inicializa la conexión y comienza a consumir mensajes.
    """
    conn = get_rabbit_connection()
    channel = conn.channel()

    # Asegura que la cola exista (durable para persistencia ante reinicios)
    channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

    # Solo un mensaje sin confirmar a la vez
    channel.basic_qos(prefetch_count=1)

    # Suscribe el callback al queue
    channel.basic_consume(
        queue=settings.RABBITMQ_QUEUE,
        on_message_callback=callback,
    )

    logger.info(f"Escuchando eventos en la cola '{settings.RABBITMQ_QUEUE}'...")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Interrupción manual, cerrando consumidor...")
        channel.stop_consuming()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
