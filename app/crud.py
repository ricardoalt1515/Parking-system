from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from .models import Ticket, Auditoria, ConfiguracionSistema
from .config import SessionLocal
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


def obtener_ticket(db: Session, folio: str = None, ticket_id: int = None):
    if folio:
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()
    elif ticket_id:
        return db.query(Ticket).filter(Ticker.folio == folio).first()
    return None


def actualizar_estado(
    db: Session, folio: str, tarifa_base: float, tarifa_excedente: float
):
    ticket = db.query(Ticket).filter(Ticket.folio == folio).first()
    if ticket:
        ticket.estado = nuevo_estado
        db.commit()
        return ticket
    return None


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


def calcular_tarifa(entrada, salida, tarifa_base=20.0, tarifa_excedente=10.0):
    if not entrada or not salida:
        raise ValueError("La hora de entrada y salida deben estar definidas.")

    # Duración total en minutos
    duracion_total = (salida - entrada).total_seconds() / 60

    # Primera hora: siempre tarifa base
    if duracion_total <= 60:
        return tarifa_base

    # Calcular horas excedentes completas
    horas_excedentes = (duracion_total - 60) // 60
    return tarifa_base + (horas_excedentes * tarifa_excedente)


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


def obtener_configuracion(db: Session):
    config = db.query(ConfiguracionSistema).first()
    if not config:
        # Configuración por defecto
        config = ConfiguracionSistema()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def actualizar_configuracion(db: Session, nueva_config: dict):
    config = db.query(ConfiguracionSistema).first()
    if not config:
        config = ConfiguracionSistema(**nueva_config)
        db.add(config)
    else:
        for key, value in nueva_config.items():
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config
