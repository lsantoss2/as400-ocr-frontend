import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [analisis, setAnalisis] = useState([]);
  const [estados, setEstados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, porTipo: {} });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Cargar datos del backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (filter = false) => {
    try {
      const params = filter ? { startDate, endDate } : {};
      const [analisisRes, estadosRes, usuariosRes] = await Promise.all([
        axios.get("http://localhost:4000/api/analisis", { params }),
        axios.get("http://localhost:4000/api/estados", { params }),
        axios.get("http://localhost:4000/api/usuarios", { params }),
      ]);

      setAnalisis(analisisRes.data);
      setEstados(estadosRes.data);
      setUsuarios(usuariosRes.data);

      // Calcular resumen
      const total = analisisRes.data.length;
      const porTipo = analisisRes.data.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + 1;
        return acc;
      }, {});
      setResumen({ total, porTipo });
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const handleFiltrar = () => {
    fetchData(true);
  };

  const handleLimpiar = () => {
    setStartDate("");
    setEndDate("");
    fetchData(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-8 flex items-center justify-center gap-2">
        📊 Dashboard AS400 OCR
      </h1>

      {/* 🔍 Filtros */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleFiltrar}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Filtrar
        </button>
        <button
          onClick={handleLimpiar}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition"
        >
          Limpiar
        </button>
      </div>

      {/* 📋 Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h3 className="text-gray-600 font-semibold">Total registros</h3>
          <p className="text-3xl font-bold text-blue-800">{resumen.total}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h3 className="text-gray-600 font-semibold">Por tipo</h3>
          {Object.keys(resumen.porTipo).length > 0 ? (
            Object.entries(resumen.porTipo).map(([tipo, cantidad]) => (
              <p key={tipo} className="text-gray-800">
                {tipo}: <span className="font-semibold">{cantidad}</span>
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic">Sin datos</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h3 className="text-gray-600 font-semibold">Última actualización</h3>
          <p className="text-sm text-gray-700">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* 📊 Distribución por Estado */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
        <h3 className="text-lg font-bold text-blue-800 text-center mb-4">
          Distribución por Estado
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={estados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 👥 Actividad por Usuario */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
        <h3 className="text-lg font-bold text-blue-800 text-center mb-4">
          Actividad por Usuario
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usuarios}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="usuario" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧾 Registros detallados */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-blue-800 text-center mb-4">
          Registros detallados
        </h3>
        {analisis.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No se han registrado análisis todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Función</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {analisis.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{a.id}</td>
                    <td className="px-4 py-2">{a.tipo}</td>
                    <td className="px-4 py-2">{a.usuario}</td>
                    <td className="px-4 py-2">{a.funcion}</td>
                    <td className="px-4 py-2">{a.estado}</td>
                    <td className="px-4 py-2">
                      {new Date(a.fecha).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
