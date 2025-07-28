import json
from app.config.rabbitmq import publish_message

def publicar_evento_creado(evento_id: int, aforo: int, nombre: str, precio: float):
    event = {
        "tipo": "nuevo_evento",
        "payload": {
            "id": evento_id,
            "aforo": aforo,
            "nombre": nombre,   # 👈 incluir nombre del evento
            "precio": precio
        }
    }
    publish_message(json.dumps(event))

def publicar_evento_cancelado(evento_id: int):
    mensaje = {
        "tipo": "evento_cancelado",
        "payload": {
            "evento_id": evento_id
        }
    }
    publish_message(json.dumps(mensaje))


def publicar_evento_finalizado(nombre: str):
    mensaje = {
        "evento": "evento_finalizado",
        "nombre": nombre
    }
    publish_message(json.dumps(mensaje))
