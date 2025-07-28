from sqlalchemy.orm import Session
from app.model.entrada_model import Entrada

def procesar_evento_creado(data: dict, db: Session):
    evento_id = data.get("id")
    aforo = data.get("aforo")
    precio = data.get("precio", 0.0)

    if not evento_id or not aforo:
        print("❌ Evento inválido")
        return

    print(f"🎫 Generando {aforo} entradas para evento {evento_id}")
    for _ in range(aforo):
        entrada = Entrada(evento_id=evento_id, precio=precio)
        db.add(entrada)
    db.commit()

def cancelar_entradas_evento(evento_id: int, db: Session):
    entradas = db.query(Entrada).filter(
        Entrada.evento_id == evento_id,
        Entrada.usuario_id != None
    ).all()
    for entrada in entradas:
        entrada.estado = "cancelada"
    db.commit()
