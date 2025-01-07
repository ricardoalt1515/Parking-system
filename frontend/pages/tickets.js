


import Notification, { notify } from "../components/Notification";
import React, { useState, useEffect } from "react";
import api from "../services/api";
import TicketActionModal from "../components/TicketActionModal";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [action, setAction] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchTickets = async (filterParams = {}) => {
    try {
      setLoading(true);
      const response = await api.get("/tickets/", { params: filterParams });
      setTickets(response.data.tickets || []);
      notify("Tickets cargados correctamente.", "success");
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      notify("Error al cargar los tickets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (actionType) => {
    try {
      const endpoint = `/tickets/${selectedTicket.folio}/${actionType}`;
      const response = await api.post(endpoint);

      notify(response.data.message, "success");

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.folio === selectedTicket.folio ? response.data.ticket : ticket
        )
      );
    } catch (error) {
      console.error(`Error al ${actionType} ticket:`, error);
      notify(`Error al ${actionType} el ticket.`, "error");
    } finally {
      setSelectedTicket(null);
      setAction("");
    }
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    let params = {};
    if (filterType === "today") {
      const today = new Date();
      params = {
        desde: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
        hasta: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
      };
    } else if (filterType === "last12hours") {
      const now = new Date();
      params = {
        desde: new Date(now.setHours(now.getHours() - 12)).toISOString(),
        hasta: new Date().toISOString(),
      };
    } else if (filterType === "lastWeek") {
      const now = new Date();
      params = {
        desde: new Date(now.setDate(now.getDate() - 7)).toISOString(),
        hasta: new Date().toISOString(),
      };
    }
    fetchTickets(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-black">Cargando tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Notification />

      <h1 className="text-4xl font-bold text-black mb-8">Gestión de Tickets</h1>
      <div className="mb-4">
        <button
          className={`mr-4 px-4 py-2 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => handleFilterChange("all")}
        >
          Todos
        </button>
        <button
          className={`mr-4 px-4 py-2 rounded ${filter === "today" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => handleFilterChange("today")}
        >
          Hoy
        </button>
        <button
          className={`mr-4 px-4 py-2 rounded ${filter === "last12hours" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => handleFilterChange("last12hours")}
        >
          Últimas 12 horas
        </button>
        <button
          className={`px-4 py-2 rounded ${filter === "lastWeek" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => handleFilterChange("lastWeek")}
        >
          Última semana
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Folio</th>
              <th className="py-3 px-6 text-left">Estado</th>
              <th className="py-3 px-6 text-left">Monto</th>
              <th className="py-3 px-6 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.folio}
                className="border-b hover:bg-blue-50 transition"
              >
                <td className="py-3 px-6 text-black">{ticket.folio}</td>
                <td
                  className={`py-3 px-6 font-semibold ${ticket.estado === "Pendiente"
                    ? "text-yellow-500"
                    : ticket.estado === "Pagado"
                      ? "text-green-500"
                      : "text-red-500"
                    }`}
                >
                  {ticket.estado}
                </td>
                <td className="py-3 px-6 text-black">${ticket.monto || "-"}</td>
                <td className="py-3 px-6 space-x-4">
                  {ticket.estado === "Pendiente" && (
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setAction("pagar");
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Pagar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAction("cancelar");
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <TicketActionModal
          ticket={selectedTicket}
          action={action}
          onConfirm={() => handleAction(action)}
          onCancel={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

