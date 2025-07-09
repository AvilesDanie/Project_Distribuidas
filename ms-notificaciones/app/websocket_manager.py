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
        for ws in self.connections.get(usuario_id, []):
            await ws.send_text(message)

    async def broadcast_global(self, message: str):
        for ws in self.global_connections:
            await ws.send_text(message)

# ✅ Esta es la instancia única que debes importar
manager = WebSocketManager()
