import json
from app.config.rabbitmq import publish_message
from app.config.settings import settings

def publish_user_created(user_id: int):
    event = {
        "tipo": "usuario_creado",
        "payload": {
            "usuario_id": user_id,
            "titulo": "Bienvenido!",
            "mensaje": "Te has registrado exitosamente en la plataforma.",
            "tipo": "success"
        }
    }
    publish_message(json.dumps(event), settings.RABBITMQ_NOTIF_QUEUE)
    print(f"✅ Notificación de usuario creado enviada: {user_id}")
