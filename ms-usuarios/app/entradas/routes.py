from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_entradas_base():
    return {"mensaje": "entradas operando"}
