from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.websocket_manager import WebSocketManager
from fastapi.middleware.cors import CORSMiddleware
from app.controller.notificacion_controller import router as notificacion_router

app = FastAPI(title="ms-notificaciones")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas HTTP
app.include_router(notificacion_router, prefix="/api/v1/notificaciones", tags=["Notificaciones"])

# WebSocket Manager
manager = WebSocketManager()

@app.websocket("/ws/notificaciones")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # ✅ DEBE SER LO PRIMERO
    try:
        usuario_id = websocket.query_params.get("usuario_id")
        usuario_id = int(usuario_id) if usuario_id else None
        await manager.connect(websocket, usuario_id)
        while True:
            await websocket.receive_text()  # Solo mantiene la conexión viva
    except WebSocketDisconnect:
        manager.disconnect(websocket)
