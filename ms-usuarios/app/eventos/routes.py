from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_eventos_base():
    return {"mensaje": "eventos operando"}
