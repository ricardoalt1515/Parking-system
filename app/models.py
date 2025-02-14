from app.schemas import TarifaBase
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from .config import SessionLocal
from .database import Base, engine
from datetime import datetime, timezone
from sqlalchemy.orm import relationship


class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String, unique=True, index=True)
    estado = Column(
        String, default="Pendiente"
    )  # Pendiente, Pagado, Cancelado, Bonificado
    creado = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )  # Fecha de creación en UTC
    tarifa = Column(Float, default=0.0)
    entrada = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )  # Fecha de entrada en UTC
    salida = Column(DateTime, nullable=True)
    tiempo_limite = Column(
        DateTime, nullable=True
    )  # Tiempo límite para salida después del pago


class Auditoria(Base):
    __tablename__ = "auditorias"
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, nullable=False)  # Usuario que realiza la acción
    accion = Column(String, nullable=False)  # Acción realizada
    detalle = Column(
        String, nullable=True
    )  # Detalles adicionales (e.g., "Ticket folio T-1234")
    fecha = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )  # Fecha y hora de la acción


class ConfiguracionSistema(Base):
    __tablename__ = "configuracion_sistema"

    id = Column(Integer, primary_key=True, index=True)
    tarifa_base = Column(Float, default=20.0)
    tarifa_excedente = Column(Float, default=10.0)
    tiempo_limite_salida = Column(Integer, default=15)
