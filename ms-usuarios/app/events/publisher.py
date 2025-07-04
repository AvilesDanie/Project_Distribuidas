import json
from app.config.rabbitmq import publish_message

def publish_user_created(user_id: int):
    event = {
        "event": "usuario_creado",
        "user_id": user_id
    }
    publish_message(json.dumps(event))
