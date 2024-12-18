from fastapi import FastAPI

app = FastAPI()


@app.post("/open-barrera")
def open_barrera(ticket: dict):
    # Simula la apertura de la barrera
    print(f"Barrera abierta para el ticket: {ticket['ticket']}")
    return {"status": "success", "message": "Barrera abierta"}
