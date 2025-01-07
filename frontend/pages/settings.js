
import React, { useState, useEffect } from "react";
import api from "../services/api";
import Notification, { notify } from "../components/Notification";

export default function Settings() {
  const [config, setConfig] = useState({
    tarifaBase: 0,
    tarifaExcedente: 0,
    tiempoLimite: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await api.get("/configuracion/");
        setConfig(response.data || config);
        notify("Configuración cargada correctamente.", "success");
      } catch (error) {
        console.error("Error al obtener configuración:", error);
        notify("Error al cargar la configuración.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  // Save configuration
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/configuracion/", config);
      notify("Configuración guardada correctamente.", "success");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      notify("Ocurrió un error al guardar la configuración.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Notification />
        <p className="text-lg font-semibold text-gray-900">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      {/* Notificaciones */}
      <Notification />

      <h1 className="text-4xl font-bold text-gray-900 mb-8">Configuración del Sistema</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
        <form>
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">
              Tarifa Base (MXN)
            </label>
            <input
              type="number"
              value={config.tarifaBase}
              onChange={(e) => handleInputChange("tarifaBase", parseFloat(e.target.value))}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-900"
              min="0"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">
              Tarifa Excedente (MXN)
            </label>
            <input
              type="number"
              value={config.tarifaExcedente}
              onChange={(e) => handleInputChange("tarifaExcedente", parseFloat(e.target.value))}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-900"
              min="0"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-900 font-semibold mb-2">
              Tiempo Límite de Salida (minutos)
            </label>
            <input
              type="number"
              value={config.tiempoLimite}
              onChange={(e) => handleInputChange("tiempoLimite", parseInt(e.target.value, 10))}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-900"
              min="1"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`w-full p-3 rounded-lg font-semibold text-white ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}

