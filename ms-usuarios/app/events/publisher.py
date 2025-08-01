import json
from app.config.rabbitmq import publish_message
from app.config.settings import settings

def publish_user_created(user_id: int):
    event = {
        "tipo": "usuario_creado",
        "payload": {
            "usuario_id": user_id,
            "mensaje": "Un nuevo administrador ha sido creado.",
            "tipo": "INFO"
        }
    }
    publish_message(json.dumps(event), settings.RABBITMQ_NOTIF_QUEUE)
