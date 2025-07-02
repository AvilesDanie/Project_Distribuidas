from fastapi import FastAPI

app = FastAPI()

@app.get("/api/v1/eventos/")
async def read_root():
    return {"message": "Hola desde Eventos"}
