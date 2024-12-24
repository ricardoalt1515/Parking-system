from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from .models import Ticket, Auditoria
from .utils import calcular_tarifa
from datetime import datetime, timedelta, timezone
import qrcode
from io import BytesIO
import base64


def crear_ticket_en_db(db: Session, ticket_data: dict):
    tiempo_limite = datetime.now(timezone.utc) + timedelta(minutes=15)
    nuevo_ticket = Ticket(
        folio=ticket_data["folio"],
        estado=ticket_data.get("estado", "Pendiente"),
        creado=datetime.now(timezone.utc),
        entrada=datetime.now(timezone.utc),
        tiempo_limite=tiempo_limite,
        tarifa=ticket_data.get("tarifa", 0.0),
    )
    db.add(nuevo_ticket)
    db.commit()
    db.refresh(nuevo_ticket)
    return nuevo_ticket


def obtener_ticket(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def actualizar_estado(db: Session, ticket_id: int, nuevo_estado: str):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket:
        ticket.estado = nuevo_estado
        db.commit()
        return ticket
    return None


def calcular_total(
    db: Session, ticket_id: int, tarifa_base: float, tarifa_excedente: float
):
    ticket = obtener_ticket(db, ticket_id)
    if ticket and ticket.entrada:
        tiempo_actual = datetime.datetime.utcnow()
        return calcular_tarifa(
            ticket.entrada, tiempo_actual, tarifa_base, tarifa_excedente
        )
    return 0


def generar_codigo_qr(data: str):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)

    buffer = BytesIO()
    qr.make_image(fill="black", back_color="white").save(buffer)
    buffer.seek(0)

    # Retorna la cadena en formato base64
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def revalidar_boletos(db: Session):
    """
    Revalida todos los tickets vencidos, cambiando su estado a 'Pendiente'.
    """
    tiempo_actual = datetime.datetime.utcnow()
    boletos_vencidos = (
        db.query(Ticket)
        .filter(Ticket.estado == "Pagado", Ticket.tiempo_limite < tiempo_actual)
        .all()
    )

    for boleto in boletos_vencidos:
        boleto.estado = "Pendiente"
        boleto.tiempo_limite = None
    db.commit()
    return len(boletos_vencidos)


def validar_ticket_para_salida(db: Session, folio: str):
    """
    Verifica si un ticket es válido para salida.
    """
    ticket = db.query(Ticket).filter(Ticket.folio == folio).first()

    if not ticket:
        return {"valid": False, "message": "Ticket no encontrado"}
    if ticket.estado != "Pagado":
        return {"valid": False, "message": "El ticket no está pagado"}
    if ticket.tiempo_limite and ticket.tiempo_limite < datetime.utcnow():
        return {"valid": False, "message": "El ticket ha vencido"}

    ticket.estado = "Completado"
    db.commit()
    return {"valid": True, "message": "Salida autorizada"}


def generar_reporte(db: Session):
    """
    Genera un reporte de ingresos y tickets procesados.
    """
    ingresos_totales = (
        db.query(func.sum(Ticket.tarifa)).filter(Ticket.estado == "Pagado").scalar()
        or 0
    )
    tickets_totales = db.query(Ticket).count()

    return {
        "ingresos_totales": ingresos_totales,
        "tickets_totales": tickets_totales,
    }


def registrar_auditoria(db: Session, usuario: str, accion: str, detalle: str = None):
    nueva_auditoria = Auditoria(usuario=usuario, accion=accion, detalle=detalle)
    db.add(nueva_auditoria)
    db.commit()
    db.refresh(nueva_auditoria)
    return nueva_auditoria


def obtener_auditorias(db: Session, skip: int = 0, limit: int = 50):
    return (
        db.query(Auditoria)
        .order_by(Auditoria.fecha.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def calcular_tarifa(hora_entrada, tarifa_base, tarifa_excedente):
    ahora = datetime.utcnow()
    duracion = (ahora - hora_entrada).total_seconds() / 60  # Duracion en minutpos

    if duracion <= 60:
        return tarifa_base
    else:
        excedente = duracion - 60
        return tarifa_base + (excedente * tarifa_excedente)


def validar_salida(db: Session, ticket_id: int):
    ticket = obtener_ticket(db, ticket_id)
    if not ticket:
        return {"valid": False, "message": "Ticket no encontrado"}

    if ticket.estado != "Pagado":
        return {"valid": False, "message": "El ticket no está pagado"}

    if ticket.tiempo_limite and ticket.tiempo_limite < datetime.datetime.utcnow():
        return {"valid": False, "message": "El ticket ha vencido"}

    ticket.estado = "Completado"
    db.commit()
    return {"valid": True, "message": "Salida autorizada"}
