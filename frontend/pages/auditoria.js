import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Auditorias() {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAuditorias = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auditorias/?page=${currentPage}`);
        setAuditorias(response.data.auditorias || []);
      } catch (error) {
        console.error("Error al obtener auditorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditorias();
  }, [currentPage]);

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg font-medium animate-pulse">
          Cargando auditorías...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Auditorías
      </h1>

      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">
                Acción
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 bg-gray-50">
            {auditorias.map((auditoria) => (
              <tr key={auditoria.id} className="hover:bg-gray-100 transition">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {new Date(auditoria.fecha).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {auditoria.usuario}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {auditoria.accion}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {auditoria.detalle}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePreviousPage}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-gray-400 transition"
        >
          Anterior
        </button>
        <button
          onClick={handleNextPage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
