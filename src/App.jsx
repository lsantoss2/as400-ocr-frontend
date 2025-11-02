import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DocxUploader from "./components/DocxUploader";
import OcrUploader from "./components/OcrUploader";
import Usuarios from "./components/Usuarios";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";

// 🧠 Componente de ruta protegida
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔑 Página inicial: Login */}
        <Route path="/" element={<Login />} />

        {/* 🔒 Rutas protegidas: requieren token */}
        <Route
          path="/app/*"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">
                {/* 🧭 Barra lateral */}
                <Sidebar />

                {/* 🧩 Contenido principal */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="reportes" element={<DocxUploader />} />
                    <Route path="ocr" element={<OcrUploader />} />
                    <Route path="usuarios" element={<Usuarios />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
