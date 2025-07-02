from fastapi import FastAPI

app = FastAPI()

@app.get("/api/v1/entradas/")
async def read_root():
    return {"message": "Hola desde Entradas"}
