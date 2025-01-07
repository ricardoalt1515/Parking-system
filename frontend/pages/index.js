
import Notification, { notify } from "../components/Notification";
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { DollarSign, Ticket, BarChart2 } from "lucide-react";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800"];

export default function Dashboard() {
  const [stats, setStats] = useState({ ingresos: 0, tickets: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/reportes/");
        setStats({
          ingresos: response.data.ingresos_totales,
          tickets: response.data.tickets_totales,
        });

        // Generate chart data
        setChartData([
          { name: "Tickets Pendientes", value: response.data.tickets_totales - 20 },
          { name: "Tickets Pagados", value: 20 },
        ]);
        notify("Estadísticas cargadas correctamente.", "success");
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        notify("Error al cargar estadísticas.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Generate ticket
  const handleGenerateTicket = async () => {
    try {
      const response = await api.post("/tickets/", { folio: `T-${Date.now()}` });
      setTicketData(response.data);
      notify("Ticket generado correctamente.", "success");
    } catch (error) {
      console.error("Error al generar ticket:", error);
      notify("Ocurrió un error al generar el ticket.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-black">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Notificaciones */}
      <Notification />

      <h1 className="text-4xl font-bold text-black mb-8">Dashboard</h1>
      <button
        onClick={handleGenerateTicket}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Generar Ticket
      </button>

      {ticketData && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-black">Ticket Generado:</h2>
          <p className="text-black">Folio: {ticketData.ticket.folio}</p>
          <img
            src={`data:image/png;base64,${ticketData.qr_code}`}
            alt="Código QR"
            className="mt-4"
          />
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition">
          <DollarSign className="text-green-500 w-12 h-12 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-black">Ingresos Totales</h2>
            <p className="text-3xl font-bold text-black">${stats.ingresos} MXN</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition">
          <Ticket className="text-blue-500 w-12 h-12 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-black">Tickets Procesados</h2>
            <p className="text-3xl font-bold text-black">{stats.tickets}</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center hover:shadow-xl transition">
          <BarChart2 className="text-yellow-500 w-12 h-12 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-black">Reporte Mensual</h2>
            <p className="text-3xl font-bold text-black">En progreso</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Distribución de Tickets</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Ingresos por Día</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Lunes", ingresos: 1200 },
                { name: "Martes", ingresos: 800 },
                { name: "Miércoles", ingresos: 1500 },
                { name: "Jueves", ingresos: 1800 },
                { name: "Viernes", ingresos: 2300 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

