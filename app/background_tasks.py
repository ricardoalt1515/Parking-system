from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Ticket
from app.database import SessionLocal
from app.settings import EXIT_TIME_LIMIT_MINUTES


def reset_expired_tickets():
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        time_limit = timedelta(minutes=EXIT_TIME_LIMIT_MINUTES)

        # Buscar tickets pagados cuyo tiempo límite ha expirado
        expired_tickets = (
            db.query(Ticket)
            .filter(Ticket.estado == "Pagado", Ticket.salida + time_limit < now)
            .all()
        )

        for ticket in expired_tickets:
            ticket.estado = "Pendiente"
            ticket.salida = None
            ticket.total = 0.0
            db.commit()

    finally:
        db.close()
