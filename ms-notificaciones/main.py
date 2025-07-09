import asyncio
import threading
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.controller.notificacion_controller import router as notificacion_router
from app.websocket_manager import manager
from app.listener.consumer import start_listener
from app.config.database import Base, engine
from app.event_loop_context import set_loop

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    root_path="/api/v1/notificaciones"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Capturar el loop principal
    set_loop(asyncio.get_running_loop())
    print("🌟 Loop principal capturado")

# Registrar las rutas HTTP
app.include_router(notificacion_router, prefix="/notificaciones", tags=["Notificaciones"])

# Iniciar el listener en un hilo separado
threading.Thread(target=start_listener, daemon=True).start()

@app.websocket("/ws/notificaciones")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        user_id = websocket.query_params.get("usuario_id")
        user_id = int(user_id) if user_id else None
        await manager.connect(websocket, user_id)
        while True:
            await websocket.receive_text()  # mantiene la conexión viva
    except WebSocketDisconnect:
        manager.disconnect(websocket)
