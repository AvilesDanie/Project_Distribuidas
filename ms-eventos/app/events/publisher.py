import json
from app.config.rabbitmq import publish_message

def publish_evento_creado(evento_id: int):
    event = {
        "event": "evento_creado",
        "evento_id": evento_id
    }
    publish_message(json.dumps(event))
