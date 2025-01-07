
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function TicketActionModal({ ticket, action, onConfirm, onCancel }) {
  const [tarifa, setTarifa] = useState(null);

  useEffect(() => {
    if (action === "pagar") {
      const fetchTarifa = async () => {
        try {
          const response = await api.post(`/tickets/${ticket.folio}/pagar`, { preview: true });
          setTarifa(response.data.tarifa);
        } catch (error) {
          console.error("Error al calcular tarifa:", error);
        }
      };

      fetchTarifa();
    }
  }, [ticket, action]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Confirmar {action === "pagar" ? "Pago" : "Acción"}
        </h2>
        <p className="text-gray-600 mb-6">
          {action === "pagar" && tarifa !== null
            ? `El costo total es: $${tarifa} MXN.`
            : `¿Deseas ${action} el ticket con folio ${ticket.folio}?`}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${action === "pagar"
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

