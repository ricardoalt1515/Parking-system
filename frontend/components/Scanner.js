import React, { useState } from "react";
import api from "../services/api";

export default function Scanner() {
  const [ticketCode, setTicketCode] = useState("");
  const [message, setMessage] = useState("");

  const handleScan = async () => {
    try {
      const response = await api.post("/tickets/validar/", {
        folio: ticketCode,
      });
      setMessage(response.data.message);
      if (response.data.valid) {
        alert("Salida autorizada");
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error al validar el ticket:", error);
      setMessage("Ocurrió un error. Intente de nuevo.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Escaneo de Ticket</h1>
      <div className="mt-4">
        <label className="block">Código del Ticket:</label>
        <input
          type="text"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleScan}
          className="bg-blue-500 text-white px-4 py-2 mt-4"
        >
          Escanear
        </button>
      </div>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
