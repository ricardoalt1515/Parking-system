import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Settings() {
  const [config, setConfig] = useState({
    tarifaBase: 0,
    tarifaExcedente: 0,
  });

  const handleInputChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const saveConfig = async () => {
    if (config.tarifaBase <= 0 || config.tarifaExcedente <= 0) {
      alert("Por favor, ingrese valores positivos para las tarifas.");
      return;
    }

    try {
      await api.put("/configuracion/", config);
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("Error al guardar la configuración.");
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get("/configuracion/");
        setConfig(response.data);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Configuración del Sistema
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto space-y-6">
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Tarifa Base (MXN):
          </label>
          <input
            type="number"
            value={config.tarifaBase}
            onChange={(e) => handleInputChange("tarifaBase", e.target.value)}
            className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="Ingrese la tarifa base"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Tarifa Excedente (MXN):
          </label>
          <input
            type="number"
            value={config.tarifaExcedente}
            onChange={(e) =>
              handleInputChange("tarifaExcedente", e.target.value)
            }
            className="border border-gray-300 px-4 py-2 w-full rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="Ingrese la tarifa excedente"
          />
        </div>

        <button
          onClick={saveConfig}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
