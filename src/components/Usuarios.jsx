import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    password: "",
    rol: 0, // 0 = usuario, 1 = admin
  });

  // 🔄 Obtener lista de usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/usuarios/listar");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 💾 Crear usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/usuarios/crear", nuevoUsuario);
      alert("✅ Usuario creado correctamente");
      setShowForm(false);
      setNuevoUsuario({ nombre: "", password: "", rol: 0 });
      fetchUsuarios(); // refresca la tabla
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("❌ Error al crear usuario. Ver consola para detalles.");
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Lista de Usuarios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Crear Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Nombre</th>
              <th className="py-2 px-3">Rol</th>
              <th className="py-2 px-3">Fecha creación</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{u.id}</td>
                  <td className="py-2 px-3">{u.nombre}</td>
                  <td className="py-2 px-3">
                    {u.rol === 1 ? "Administrador" : "Usuario"}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(u.fecha_creacion).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🧾 Modal para crear usuario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              Crear nuevo usuario
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del usuario"
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg p-2 mb-3"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg p-2 mb-3"
              />

              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    rol: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              >
                <option value={0}>Usuario</option>
                <option value={1}>Administrador</option>
              </select>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
