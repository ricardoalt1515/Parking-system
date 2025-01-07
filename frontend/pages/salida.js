
import React, { useState } from "react";
import api from "../services/api";

export default function Salida() {
  const [ticketCode, setTicketCode] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    try {
      setLoading(true);
      setIsValid(null);
      setMessage("");

      const response = await api.post("/tickets/validar_salida/", { folio: ticketCode });
      setIsValid(response.data.valid);
      setMessage(response.data.message);

      if (response.data.valid) {
        setTimeout(() => {
          alert("¡Barrera abierta!");
        }, 1000);
      }
    } catch (error) {
      console.error("Error al validar el ticket:", error);
      setMessage("Error al procesar el ticket. Inténtelo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Automatización de Salida</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        <label className="block text-gray-700 font-semibold mb-2">
          Código del Ticket
        </label>
        <input
          type="text"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 mb-4"
          placeholder="Ingrese el código del ticket"
        />
        <button
          onClick={handleScan}
          disabled={loading || !ticketCode.trim()}
          className={`w-full p-3 rounded-lg font-semibold text-white ${loading || !ticketCode.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          {loading ? "Validando..." : "Escanear y Validar"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-center font-semibold ${isValid === true
                ? "bg-green-100 text-green-600"
                : isValid === false
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
          >
            {message}
          </div>
        )}

        {isValid && (
          <div className="mt-6 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-ping"></div>
            <span className="text-lg font-semibold text-gray-700 ml-4">
              Apertura de barrera...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

