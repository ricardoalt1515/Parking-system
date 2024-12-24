from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Ticket(BaseModel):
    id: int
    folio: str
    estado: str
    entrada: datetime
    salida: Optional[datetime] = None
    total: Optional[float] = None
    qr_code: Optional[str] = None

    class Config:
        orm_mode = True


class TicketBase(BaseModel):
    folio: str
    estado: str
    entrada: datetime
    salida: Optional[datetime]
    total: Optional[float] = 0.0


class TicketCreate(BaseModel):
    folio: str
    estado: str = "Pendiente"
    entrada: datetime | None = None
    tiempo_limite: datetime | None = None


class TicketUpdate(BaseModel):
    estado: Optional[str]
    salida: Optional[datetime]
    total: Optional[float]


class TarifaBase(BaseModel):
    primera_hora: float
    tarifa_excedente: float


class ActualizarEstadoRequest(BaseModel):
    estado: str


class UsuarioBase(BaseModel):
    nombre: str
    rol: str


class UsuarioCreate(UsuarioBase):
    password: str


class AuditoriaBase(BaseModel):
    usuario_id: int
    accion: str
    fecha_hora: datetime
