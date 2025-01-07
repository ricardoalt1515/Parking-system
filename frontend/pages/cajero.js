
import React, { useState } from "react";
import api from "../services/api";
import Notification, { notify } from "../components/Notification";

export default function Cajero() {
  const [ticket, setTicket] = useState(null);
  const [folio, setFolio] = useState("");
  const [loading, setLoading] = useState(false);

  // Escanear ticket por folio
  const handleScan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${folio}`);
      setTicket({
        ...response.data,
        tarifa: response.data.tarifa || 0, // Asegúrate de asignar la tarifa
      });
      notify("Ticket escaneado correctamente.", "success");
    } catch (error) {
      console.error("Error al escanear ticket:", error);
      notify("No se pudo encontrar el ticket.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar pago del ticket
  const handlePayment = async () => {
    try {
      const response = await api.post(`/tickets/${ticket.folio}/pagar`);
      setTicket({ ...ticket, estado: "Pagado" });
      notify("Pago confirmado correctamente.", "success");
    } catch (error) {
      console.error("Error al confirmar pago:", error);
      notify("Error al procesar el pago.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Notification />
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Cajero Vivo</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <input
          type="text"
          placeholder="Escanea o ingresa el folio del ticket"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-900 placeholder-gray-500 mb-4"
        />
        <button
          onClick={handleScan}
          className={`w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition ${loading ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={loading}
        >
          {loading ? "Escaneando..." : "Escanear Ticket"}
        </button>
      </div>

      {ticket && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Información del Ticket</h2>
          <div className="space-y-2">
            <p className="text-lg text-gray-600">Folio: <span className="font-semibold text-gray-900">{ticket.folio}</span></p>
            <p className="text-lg text-gray-600">Estado: <span className={`font-semibold ${ticket.estado === "Pagado" ? "text-green-500" : "text-yellow-500"}`}>{ticket.estado}</span></p>
            <p className="text-lg text-gray-600">Tarifa: <span className="font-semibold text-gray-900">${ticket.tarifa ? ticket.tarifa.toFixed(2) : "Calculando..."}</span></p>
          </div>
          {ticket.estado !== "Pagado" && (
            <button
              onClick={handlePayment}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition mt-4"
            >
              Confirmar Pago
            </button>
          )}
        </div>
      )}
    </div>
  );
}

