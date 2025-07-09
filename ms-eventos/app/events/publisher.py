import json
from app.config.rabbitmq import publish_message

def publicar_evento_creado(evento_id: int, aforo: int):
    event = {
        "tipo": "nuevo_evento",
        "payload": {
            "id": evento_id,
            "aforo": aforo
        }
    }
    publish_message(json.dumps(event))

def publicar_evento_finalizado(nombre: str):
    mensaje = {
        "evento": "evento_finalizado",
        "nombre": nombre
    }
    publish_message(json.dumps(mensaje))
