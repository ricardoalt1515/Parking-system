import datetime


def calcular_tarifa(entrada, salida, tarifa_base, tarifa_excedente):
    tiempo_total = (salida - entrada).total_seconds() / 3600  # Horas totales
    if tiempo_total <= 1:
        return tarifa_base
    return tarifa_base + (tiempo_total - 1) * tarifa_excedente
