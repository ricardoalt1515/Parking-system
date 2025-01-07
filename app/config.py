import os
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./estacionamiento.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class ConfiguracionSistema(BaseModel):
    tarifa_base: float = 20.0  # Precio por la primera hora
    tarifa_excedente: float = 10.0  # Precio por hora adicional
    tiempo_limite_salida: int = 15  # Tiempo en minutos


configuracion_actual = ConfiguracionSistema()
