from app.config.rabbitmq import publish_message

def publish_entrada_comprada(entrada_id: int, usuario_id: int):
    """Publica evento cuando se compra una entrada"""
    try:
        # Mensaje para el microservicio de notificaciones
        notification_message = {
            "tipo": "entrada_comprada",
            "payload": {
                "usuario_id": usuario_id,
                "titulo": "¡Entrada Comprada!",
                "mensaje": f"Has comprado exitosamente la entrada #{entrada_id}. ¡Disfruta el evento!",
                "tipo": "success"
            }
        }
        
        # Mensaje general del evento
        event_message = {
            "evento": "entrada_comprada",
            "entrada_id": entrada_id,
            "usuario_id": usuario_id
        }
        
        # Enviar a la cola de notificaciones
        notif_success = publish_message('notificaciones_queue', notification_message)
        # Enviar a la cola general de entradas
        event_success = publish_message('entrada_comprada', event_message)
        
        if notif_success and event_success:
            print(f"✅ Evento entrada_comprada publicado para entrada {entrada_id}")
        else:
            print(f"⚠️ No se pudo publicar completamente evento entrada_comprada para entrada {entrada_id}")
            
        return notif_success and event_success
    except Exception as e:
        print(f"❌ Error al publicar evento entrada_comprada: {e}")
        return False

def publish_entrada_cancelada(entrada_id: int, usuario_id: int):
    """Publica evento cuando se cancela una entrada"""
    try:
        # Mensaje para el microservicio de notificaciones
        notification_message = {
            "tipo": "entrada_cancelada",
            "payload": {
                "usuario_id": usuario_id,
                "titulo": "Entrada Cancelada",
                "mensaje": f"Se ha cancelado tu entrada #{entrada_id}. El reembolso será procesado en 3-5 días hábiles.",
                "tipo": "info"
            }
        }
        
        # Mensaje general del evento
        event_message = {
            "evento": "entrada_cancelada",
            "entrada_id": entrada_id,
            "usuario_id": usuario_id
        }
        
        # Enviar a la cola de notificaciones
        notif_success = publish_message('notificaciones_queue', notification_message)
        # Enviar a la cola general de entradas
        event_success = publish_message('entrada_cancelada', event_message)
        
        if notif_success and event_success:
            print(f"✅ Evento entrada_cancelada publicado para entrada {entrada_id}")
        else:
            print(f"⚠️ No se pudo publicar completamente evento entrada_cancelada para entrada {entrada_id}")
            
        return notif_success and event_success
    except Exception as e:
        print(f"❌ Error al publicar evento entrada_cancelada: {e}")
        return False


