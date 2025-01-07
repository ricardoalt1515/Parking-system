import React, { useEffect, useState } from "react";
import api, { socket } from "../services/api";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);

  // Obtener tickets del backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets/");
        setTickets(response.data);
      } catch (error) {
        console.error("Error al obtener tickets:", error);
      }
    };

    fetchTickets();

    // Integrar WebSockets
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Actualización recibida:", data);
      fetchTickets(); // Refrescar lista
    };

    return () => socket.close();
  }, []);

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th>Folio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td>{ticket.folio}</td>
            <td>{ticket.estado}</td>
            <td>
              {ticket.estado === "Pendiente" && (
                <button
                  onClick={() => pagarTicket(ticket.id)}
                  className="bg-green-500 text-white px-4 py-2"
                >
                  Pagar
                </button>
              )}
              <button className="bg-red-500 text-white px-4 py-2 ml-2">
                Cancelar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const pagarTicket = async (ticketId) => {
  try {
    await api.put(`/tickets/${ticketId}/pagar`);
    alert("Ticket pagado correctamente.");
  } catch (error) {
    console.error("Error al pagar el ticket:", error);
    alert("Error al procesar el pago.");
  }
};
