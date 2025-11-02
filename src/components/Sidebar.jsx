import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-red-800 to-red-600 text-white flex flex-col justify-between shadow-lg">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-center my-6 tracking-wide">
          BAC Credomatic Analizador
        </h2>
        <ul className="space-y-2 px-4">
          <li>
            <Link
              to="/app/dashboard"
              className={`block py-2 px-3 rounded-lg transition ${
                isActive("/app/dashboard")
                  ? "bg-red-500 font-semibold"
                  : "hover:bg-red-700"
              }`}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/app/reportes"
              className={`block py-2 px-3 rounded-lg transition ${
                isActive("/app/reportes")
                  ? "bg-red-500 font-semibold"
                  : "hover:bg-red-700"
              }`}
            >
              📄 Carga de reportes
            </Link>
          </li>
          <li>
            <Link
              to="/app/ocr"
              className={`block py-2 px-3 rounded-lg transition ${
                isActive("/app/ocr")
                  ? "bg-red-500 font-semibold"
                  : "hover:bg-red-700"
              }`}
            >
              🖼️ OCR imágenes
            </Link>
          </li>
          <li>
            <Link
              to="/app/usuarios"
              className={`block py-2 px-3 rounded-lg transition ${
                isActive("/app/usuarios")
                  ? "bg-red-500 font-semibold"
                  : "hover:bg-red-700"
              }`}
            >
              👥 Usuarios
            </Link>
          </li>
        </ul>
      </div>

      {/* Pie */}
      <div className="p-4 border-t border-red-400">
        <button
          onClick={handleLogout}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition"
        >
          🔒 Cerrar sesión
        </button>
        <p className="text-center text-xs text-red-200 mt-2">
          AS400 OCR © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
