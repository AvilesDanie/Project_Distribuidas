# app/websocket_manager.py

from fastapi import WebSocket
from typing import Dict, List

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[int, List[WebSocket]] = {}
        self.global_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, usuario_id: int = None):
        if usuario_id:
            self.connections.setdefault(usuario_id, []).append(websocket)
        else:
            self.global_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        for sockets in self.connections.values():
            if websocket in sockets:
                sockets.remove(websocket)
        if websocket in self.global_connections:
            self.global_connections.remove(websocket)

    async def send_to_user(self, usuario_id: int, message: str):
        """Envía mensaje a un usuario específico"""
        if usuario_id not in self.connections:
            print(f"⚠️ Usuario {usuario_id} no tiene conexiones WebSocket activas")
            return
            
        disconnected = []
        for ws in self.connections[usuario_id]:
            try:
                await ws.send_text(message)
            except Exception as e:
                print(f"❌ Error enviando mensaje a usuario {usuario_id}: {e}")
                disconnected.append(ws)
        
        # Limpiar conexiones muertas
        for ws in disconnected:
            self.connections[usuario_id].remove(ws)
        
        if not self.connections[usuario_id]:
            del self.connections[usuario_id]

    async def broadcast_global(self, message: str):
        """Envía mensaje a todas las conexiones globales"""
        disconnected = []
        for ws in self.global_connections:
            try:
                await ws.send_text(message)
            except Exception as e:
                print(f"❌ Error en broadcast global: {e}")
                disconnected.append(ws)
        
        # Limpiar conexiones muertas
        for ws in disconnected:
            self.global_connections.remove(ws)

# ✅ Esta es la instancia única que debes importar
manager = WebSocketManager()
