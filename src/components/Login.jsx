import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react"; // icono limpio

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/api/login", {
        nombre,
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirección según el rol
        if (user.rol === "admin") {
          navigate("/app/usuarios");
        } else {
          navigate("/app/dashboard");
        }
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-800 via-red-700 to-red-600">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-[1.01] transition">
        {/* 🔒 Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full mb-3">
            <Lock className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 text-center">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            BAC Credomatic Analizador AS400
          </p>
        </div>

        {/* 🧾 Formulario */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg shadow-md transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center font-medium">
              {error}
            </p>
          )}
        </form>

        {/* Pie de página */}
        <p className="text-xs text-gray-500 text-center mt-8">
          © {new Date().getFullYear()} BAC Credomatic • Sistema AS400 OCR
        </p>
      </div>
    </div>
  );
}
