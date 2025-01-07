import Layout from "../components/Layout";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Reports() {
  const data = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Ingresos (MXN)",
        data: [5000, 7000, 8000, 6000, 9000],
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Reportes del Sistema</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <Bar data={data} />
      </div>
    </Layout>
  );
}
