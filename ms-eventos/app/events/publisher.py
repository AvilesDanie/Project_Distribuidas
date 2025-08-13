# app/events/publisher.py
import json
from app.config.rabbitmq import publish_message

def publicar_evento_creado(evento_id: int, aforo: int, nombre: str, precio: float):
    # Notificación para usuarios
    event_notificacion = {
        "tipo": "notificacion",
        "payload": {
            "tipo": "evento",
            "mensaje": f"Se ha publicado un nuevo evento: {nombre} - Precio: ${precio}",
            "usuario_id": None  # Broadcast
        }
    }
    publish_message(json.dumps(event_notificacion))

    # Evento para crear entradas automáticamente
    event_entradas = {
        "tipo": "evento_publicado",
        "payload": {
            "evento_id": evento_id,
            "aforo": aforo,
            "nombre": nombre,
            "precio": precio
        }
    }
    publish_message(json.dumps(event_entradas))

def publicar_evento_cancelado(evento_id: int):
    mensaje = {"tipo": "evento_cancelado", "payload": {"evento_id": evento_id}}
    publish_message(json.dumps(mensaje))

def publicar_evento_finalizado(nombre: str):
    mensaje = {"evento": "evento_finalizado", "nombre": nombre}
    publish_message(json.dumps(mensaje))
