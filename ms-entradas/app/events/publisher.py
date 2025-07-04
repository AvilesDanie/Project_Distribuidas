import json
from app.config.rabbitmq import publish_message

def publish_entrada_comprada(entrada_id: int, usuario_id: int):
    event = {
        "event": "compra_entrada",
        "entrada_id": entrada_id,
        "usuario_id": usuario_id
    }
    publish_message(json.dumps(event))
