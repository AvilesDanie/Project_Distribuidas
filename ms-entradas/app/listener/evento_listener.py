from sqlalchemy.orm import Session
from app.model.entrada_model import Entrada

def procesar_evento_creado(data: dict, db: Session):
    evento_id = data.get("id")
    aforo = data.get("aforo")

    if not evento_id or not aforo:
        print("❌ Evento inválido")
        return

    print(f"🎫 Generando {aforo} entradas para evento {evento_id}")
    for _ in range(aforo):
        entrada = Entrada(evento_id=evento_id)
        db.add(entrada)
    db.commit()
