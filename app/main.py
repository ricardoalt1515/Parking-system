from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    APIRouter,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import Base, Auditoria, Ticket
from .crud import (
    crear_ticket_en_db,
    generar_codigo_qr,
    obtener_ticket,
    actualizar_estado,
    calcular_total,
    registrar_auditoria,
    obtener_auditorias,
    validar_ticket_para_salida,
)
from .websockets import manager
from .config import (
    obtener_configuracion,
    actualizar_configuracion,
    ConfiguracionSistema,
)
from .crud import revalidar_boletos, validar_salida, generar_reporte
from .schemas import TicketCreate, ActualizarEstadoRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia "*" por dominios específicos en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar base de datos
Base.metadata.create_all(bind=engine)


# Modelo Pydantic para validar el cuerpo de la solicitud
class ValidarSalidaRequest(BaseModel):
    folio: str


# Dependencia para la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter()


@app.get("/tickets/")
def listar_tickets(db: Session = Depends(get_db)):
    """
    Devuelve una lista de todos los tickets con su información básica.
    """
    tickets = db.query(Ticket).all()
    return {"tickets": tickets or []}  # Devuelve un array si no day datos


@app.post("/tickets/")
def crear_ticket(ticket_data: dict, db: Session = Depends(get_db)):
    nuevo_ticket = crear_ticket_en_db(db, ticket_data)
    codigo_qr = generar_codigo_qr(nuevo_ticket.folio)
    return {"message": "Ticket creado", "ticket": nuevo_ticket, "qr_code": codigo_qr}


@app.get("/tickets/{ticket_id}")
def ver_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = obtener_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    return ticket


@app.put("/tickets/{ticket_id}/estado")
def cambiar_estado(ticket_id: int, estado: str, db: Session = Depends(get_db)):
    ticket = actualizar_estado(db, ticket_id, estado)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    return {"message": "Estado actualizado", "ticket": ticket}


@app.post("/tickets/validar_salida/")
def validar_salida(request: ValidarSalidaRequest, db: Session = Depends(get_db)):
    return validar_ticket_para_salida(db, request.folio)


@router.post("/tickets/revalidar/")
def revalidar_tickets(db: Session = Depends(get_db)):
    cantidad = revalidar_boletos(db)
    return {"message": "Boletos revalidados", "cantidad": cantidad}


@app.post("/tickets/{folio}/pagar")
def pagar_ticket(folio: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.folio == folio).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    tarifa = calcular_tarifa(ticket.entrada, tarifa_base=20, tarifa_excedente=1)
    ticket.estado = "Pagado"
    ticket.tiempo_limite = datetime.utcnow() + timedelta(minutes=15)

    db.commit()
    db.refresh(ticket)
    return {"message": "Ticket pagado", "tarifa": tarifa}


@app.put("/tickets/{ticket_id}/pagar")
def pagar_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = actualizar_estado(db, ticket_id, "Pagado")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    registrar_auditoria(
        db, usuario="cajero1", accion="Pago de Ticket", detalle=f"Folio: {ticket.folio}"
    )
    return {"message": "Ticket pagado", "ticket": ticket}


@app.put("/tickets/{folio}")
def actualizar_estado(
    folio: str, request: ActualizarEstadoRequest, db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.folio == folio).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    ticket.estado = request.estado
    db.commit()
    db.refresh(ticket)

    return {"message": "Estado actualizado", "ticket": ticket}


@app.get("/tickets/{ticket_id}/calculo")
def calcular_tarifa(
    ticket_id: int,
    tarifa_base: float,
    tarifa_excedente: float,
    db: Session = Depends(get_db),
):
    total = calcular_total(db, ticket_id, tarifa_base, tarifa_excedente)
    return {"total": total}


@app.websocket("/ws/tickets/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/configuracion/")
def obtener_config():
    return obtener_configuracion()


@app.put("/configuracion/")
def actualizar_config(nueva_config: ConfiguracionSistema):
    return actualizar_configuracion(nueva_config)


@app.post("/tickets/{ticket_id}/salida/")
def salida(ticket_id: int, db: Session = Depends(get_db)):
    return validar_salida(db, ticket_id)


@app.get("/reportes/")
def reportes(db: Session = Depends(get_db)):
    return generar_reporte(db)


@app.get("/auditorias/")
def listar_auditorias(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    auditorias = obtener_auditorias(db, skip=skip, limit=limit)
    return {"auditorias": auditorias}


@app.post("/auditorias/")
def agregar_auditoria(
    usuario: str, accion: str, detalle: str = None, db: Session = Depends(get_db)
):
    auditoria = registrar_auditoria(db, usuario, accion, detalle)
    return {"message": "Auditoría registrada", "auditoria": auditoria}
