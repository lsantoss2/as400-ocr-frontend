import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    password: "",
    rol: "operador",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔍 Leer datos del usuario autenticado
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const rol = userData?.rol;

  console.log("🔎 Token guardado:", token);
  console.log("🔎 Datos del usuario:", userData);
  console.log("🔎 Rol detectado:", rol);

  // 🔄 Obtener lista de usuarios (solo si hay token y admin)
  const fetchUsuarios = async () => {
    if (!token) {
      console.warn("⚠️ No hay token en localStorage, redirigiendo al login...");
      navigate("/");
      return;
    }

    // ✅ Valida correctamente el rol admin (string)
    if (rol !== "admin") {
      console.warn("⚠️ El usuario no es admin, redirigiendo al dashboard...");
      navigate("/app/dashboard");
      return;
    }

    try {
      console.log("📡 Solicitando usuarios al backend...");
      const res = await axios.get("http://localhost:4000/api/usuarios/listar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Usuarios recibidos:", res.data);
      setUsuarios(res.data);
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("⚠️ Sesión expirada o sin permisos, vuelve a iniciar sesión.");
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // ⚙️ Ejecutar validación inicial una sola vez
  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <- importante que esté vacío

  // 💾 Crear usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/usuarios/crear",
        nuevoUsuario,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`✅ ${res.data.message || "Usuario creado correctamente"}`);
      setShowForm(false);
      setNuevoUsuario({ nombre: "", password: "", rol: "operador" });
      fetchUsuarios();
    } catch (error) {
      console.error("❌ Error al crear usuario:", error.response?.data || error.message);
      alert("❌ Error al crear usuario. Ver consola para detalles.");
    }
  };

  // ✏️ Editar rol
  const handleEditar = async (id) => {
    const nuevoRol = prompt("Nuevo rol (admin / operador):");
    if (!nuevoRol) return;

    try {
      await axios.put(
        `http://localhost:4000/api/usuarios/${id}`,
        { rol: nuevoRol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Rol actualizado correctamente.");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al editar usuario:", error);
      alert("❌ No se pudo editar el usuario.");
    }
  };

  // 🗑️ Eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Usuario eliminado correctamente.");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("❌ No se pudo eliminar el usuario.");
    }
  };

  // 🕒 Mientras valida o carga
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6 w-full md:w-10/12">
        <h1 className="text-2xl font-bold text-blue-800">👥 Lista de Usuarios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Crear Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl shadow w-full md:w-10/12 overflow-x-auto">
        <table className="min-w-full text-center text-sm text-gray-700">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{u.nombre}</td>
                  <td className="py-3 px-4">{u.rol}</td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(u.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500 italic">
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
                className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <select
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
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
