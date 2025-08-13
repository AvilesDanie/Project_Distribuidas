import os
import json
from typing import Optional, List

DEFAULT_QUEUES = (
    'entrada_comprada',
    'entrada_cancelada',
    'evento_creado',
    'evento_actualizado',
    'evento_cancelado',
    'notificaciones_queue'  # Cola para notificaciones
)

def get_rabbitmq_url():
    """Obtiene la URL de RabbitMQ desde variables de entorno"""
    from app.config.settings import settings
    return settings.RABBITMQ_URL

def _get_connection():
    """Obtiene conexión a RabbitMQ con import diferido"""
    try:
        import pika
        url = get_rabbitmq_url()
        parameters = pika.URLParameters(url)
        return pika.BlockingConnection(parameters)
    except ImportError as e:
        print(f"⚠️ pika no disponible: {e}")
        return None
    except Exception as e:
        print(f"⚠️ Error conectando a RabbitMQ: {e}")
        return None

def _open_channel(connection):
    """Abre canal y declara colas necesarias"""
    try:
        channel = connection.channel()
        
        # Declarar todas las colas necesarias
        for queue_name in DEFAULT_QUEUES:
            channel.queue_declare(queue=queue_name, durable=True)
        
        return channel
    except Exception as e:
        print(f"⚠️ Error abriendo canal RabbitMQ: {e}")
        return None

def publish_message(queue: str, message, queues: Optional[List[str]] = None):
    """
    Publica mensaje en RabbitMQ con manejo robusto de errores.
    
    Args:
        queue: Cola principal donde publicar
        message: Diccionario o string con el mensaje
        queues: Lista opcional de colas adicionales
    """
    connection = None
    try:
        connection = _get_connection()
        if not connection:
            print(f"⚠️ No hay conexión RabbitMQ disponible para {queue}")
            return False
            
        channel = _open_channel(connection)
        if not channel:
            print(f"⚠️ No se pudo abrir canal para {queue}")
            return False

        # Preparar mensaje - manejar tanto dict como string
        if isinstance(message, dict):
            message_body = json.dumps(message)
        elif isinstance(message, str):
            message_body = message
        else:
            message_body = str(message)
        
        # Lista de colas donde publicar
        target_queues = [queue]
        if queues:
            target_queues.extend(queues)
        
        # Publicar en todas las colas especificadas
        success = True
        for target_queue in target_queues:
            try:
                channel.basic_publish(
                    exchange='',
                    routing_key=target_queue,
                    body=message_body,
                    properties={'delivery_mode': 2}  # Mensaje persistente
                )
                print(f"✅ Mensaje publicado en cola '{target_queue}': {message}")
            except Exception as e:
                print(f"❌ Error publicando en '{target_queue}': {e}")
                success = False
        
        return success
        
    except Exception as e:
        print(f"❌ Error general en publish_message: {e}")
        return False
        
    finally:
        if connection and not connection.is_closed:
            try:
                connection.close()
            except:
                pass
