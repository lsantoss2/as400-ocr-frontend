import React, { useState } from "react";
import * as mammoth from "mammoth";
import Tesseract from "tesseract.js";
import axios from "axios";

// Analizadores
import { analyzeAS400Text as analyzeVisa } from "../utils/as400Analyzer";
import { analyzeMastercardText } from "../utils/mastercardAnalyzer";
import { analyzeAmexText } from "../utils/amexAnalyzer";
import { generateAS400Report } from "../utils/reportUtils";

export default function DocxUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("");
  const [imagesCount, setImagesCount] = useState(0);
  const [selectedType, setSelectedType] = useState("VISA");

  // 🧩 Selecciona el analizador según el tipo
  const getAnalyzer = (type) => {
    switch (type) {
      case "MASTERCARD":
        return analyzeMastercardText;
      case "AMEX":
        return analyzeAmexText;
      default:
        return analyzeVisa;
    }
  };

  // 🧠 Procesar archivo Word con OCR
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("🖼️ Extrayendo imágenes del documento...");
    setAnalysis(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const images = [];

      await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) =>
            image.read("base64").then((imageBuffer) => {
              images.push(`data:${image.contentType};base64,${imageBuffer}`);
              return "";
            })
          ),
        }
      );

      if (images.length === 0) {
        setStatus("⚠️ No se encontraron imágenes en el documento.");
        setIsProcessing(false);
        return;
      }

      setImagesCount(images.length);
      setStatus(`🔍 ${images.length} imágenes detectadas. Ejecutando OCR...`);

      let fullText = "";

      for (let i = 0; i < images.length; i++) {
        setStatus(`📖 Procesando imagen ${i + 1}/${images.length}...`);
        const { data } = await Tesseract.recognize(images[i], "eng", {
          logger: (m) => console.log(m),
        });
        fullText += "\n" + (data?.text || "");
      }

      setStatus(`🧩 Analizando contenido (${selectedType})...`);
      const analyzer = getAnalyzer(selectedType);
      const analysisResult = analyzer(fullText);
      analysisResult.tipo = selectedType;

      setAnalysis(analysisResult);
      setStatus(`✅ Análisis completado (${selectedType}). Puedes guardar o descargar el informe.`);
    } catch (error) {
      console.error("❌ Error procesando el documento:", error);
      setStatus("❌ Error al procesar el archivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 📄 Descargar PDF
  const handleDownloadReport = () => {
    if (!analysis) return alert("⚠️ No hay datos para generar el informe.");
    generateAS400Report(analysis);
  };

// 💾 Guardar análisis completo en la base de datos
const handleSaveToDatabase = async () => {
  if (!analysis) return alert("⚠️ No hay datos para guardar.");

  try {
    setStatus("💾 Guardando análisis en la base de datos...");

    // 1️⃣ Insertar análisis principal
    const res = await axios.post("http://localhost:4000/api/analisis", {
      tipo: analysis.tipo,
      usuario: Object.keys(analysis.usuarios)[0] || "DESCONOCIDO",
      funcion: Object.keys(analysis.registros[0] || {})[0] || "N/A",
      estado: Object.keys(analysis.estados)[0] || "N/A",
      fecha: new Date(),
    });

    const analisisId = res.data.id;

    // 2️⃣ Insertar estados (ruta correcta)
    for (const [estado, cantidad] of Object.entries(analysis.estados)) {
      await axios.post("http://localhost:4000/api/analisis/estados", {
        analisis_id: analisisId,
        estado,
        cantidad,
      });
    }

    // 3️⃣ Insertar usuarios (ruta correcta)
    for (const [usuario, cantidad] of Object.entries(analysis.usuarios)) {
      await axios.post("http://localhost:4000/api/analisis/usuarios", {
        analisis_id: analisisId,
        usuario,
        cantidad,
      });
    }

    setStatus("✅ Análisis y datos guardados exitosamente en MySQL.");
    alert("✅ Todos los datos del análisis fueron guardados correctamente.");
  } catch (err) {
    console.error("❌ Error al guardar:", err.response?.data || err.message);
    setStatus("❌ Error al guardar en la base de datos.");
    alert("❌ Ocurrió un error al guardar los datos en MySQL.");
  }
};


  return (
    <div className="p-6 bg-white rounded-2xl shadow-md w-full max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Evidencias en formato Word
      </h2>

      {/* Selector de tipo */}
      <label className="block mb-3 text-sm text-gray-700 font-medium">
        Tipo de trabajos:
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="ml-2 border border-gray-300 rounded-lg p-1 focus:ring-2 focus:ring-blue-300"
        >
          <option value="VISA">VISA</option>
          <option value="MASTERCARD">MASTERCARD</option>
          <option value="AMEX">AMERICAN EXPRESS</option>
        </select>
      </label>

      {/* Subida de archivo */}
      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        className="block w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-300"
      />

      {status && (
        <p
          className={`text-sm mb-3 whitespace-pre-wrap ${
            status.includes("Error") || status.includes("❌")
              ? "text-red-600"
              : status.includes("✅")
              ? "text-green-600"
              : "text-gray-700"
          }`}
        >
          {status}
        </p>
      )}

      {isProcessing && (
        <p className="text-blue-600 text-sm mb-4 animate-pulse">
          ⏳ Procesando {imagesCount} imágenes...
        </p>
      )}

      {/* Resultado */}
      {analysis && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🔍 Resumen de {analysis.tipo}
          </h3>

          <ul className="text-sm text-gray-700 mb-3">
            <li>
              <strong>Total de trabajos:</strong> {analysis.resumen.total}
            </li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Estados</h4>
              <ul className="text-sm">
                {Object.entries(analysis.estados).map(([k, v]) => (
                  <li key={k}>
                    {k}: <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Usuarios</h4>
              <ul className="text-sm">
                {Object.entries(analysis.usuarios).map(([k, v]) => (
                  <li key={k}>
                    {k}: <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col md:flex-row gap-3 mt-5">
            <button
              onClick={handleDownloadReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📥 Descargar informe (PDF)
            </button>

            <button
              onClick={handleSaveToDatabase}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              💾 Guardar en Base de Datos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
