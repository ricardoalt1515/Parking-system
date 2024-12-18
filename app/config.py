from pydantic import BaseModel


class ConfiguracionSistema(BaseModel):
    tarifa_base: float = 20.0  # Precio por la primera hora
    tarifa_excedente: float = 10.0  # Precio por hora adicional
    tiempo_limite_salida: int = 15  # Tiempo en minutos


configuracion_actual = ConfiguracionSistema()


def obtener_configuracion():
    return configuracion_actual


def actualizar_configuracion(nueva_config: ConfiguracionSistema):
    global configuracion_actual
    configuracion_actual = nueva_config
    return configuracion_actual
