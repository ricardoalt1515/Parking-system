import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"  # URL del servidor backend


@pytest.mark.asyncio
async def test_generate_ticket():
    async with AsyncClient(base_url=BASE_URL) as client:
        response = await client.post("/generate-ticket")
        assert response.status_code == 200
        data = response.json()
        assert "folio" in data
        assert "entry_time" in data


@pytest.mark.asyncio
async def test_get_tickets():
    async with AsyncClient(base_url=BASE_URL) as client:
        response = await client.get("/tickets")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_pay_ticket():
    async with AsyncClient(base_url=BASE_URL) as client:
        # Genera un ticket para pruebas
        ticket_response = await client.post("/generate-ticket")
        ticket = ticket_response.json()
        folio = ticket["folio"]

        # Realiza el pago
        response = await client.post(f"/pay/{folio}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "paid"


@pytest.mark.asyncio
async def test_scan_ticket():
    async with AsyncClient(base_url=BASE_URL) as client:
        # Genera y paga un ticket
        ticket_response = await client.post("/generate-ticket")
        ticket = ticket_response.json()
        folio = ticket["folio"]
        await client.post(f"/pay/{folio}")

        # Escanea el ticket
        response = await client.post(f"/scan/{folio}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "valid"


@pytest.mark.asyncio
async def test_ticket_expired():
    async with AsyncClient(base_url=BASE_URL) as client:
        # Genera y paga un ticket
        ticket_response = await client.post("/generate-ticket")
        ticket = ticket_response.json()
        folio = ticket["folio"]
        await client.post(f"/pay/{folio}")

        # Simula el vencimiento del tiempo permitido
        expiration_time = datetime.now() + timedelta(
            minutes=-11
        )  # Simula 11 minutos atrás
        response = await client.post(f"/scan/{folio}")
        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "El ticket ha expirado"
