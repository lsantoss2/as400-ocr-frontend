import React, { useState } from "react";
import Tesseract from "tesseract.js";

const OcrUploader = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText("");
      setProgress(0);
    }
  };

  const handleOcr = () => {
    if (!image) return alert("Por favor selecciona una imagen primero.");

    setLoading(true);
    setText("");

    Tesseract.recognize(image, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Extractor de texto de una imagen
      </h1>

      {/* Subir imagen */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4 border border-gray-300 p-2 rounded-lg cursor-pointer"
      />

      {/* Vista previa */}
      {image && (
        <img
          src={image}
          alt="Vista previa"
          className="w-80 h-auto mb-4 rounded-lg shadow-md"
        />
      )}

      {/* Botón OCR */}
      <button
        onClick={handleOcr}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-semibold text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Procesando..." : "Extraer texto"}
      </button>

      {/* Barra de progreso */}
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Resultado del OCR */}
      {text && (
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold mb-2">Texto detectado:</h2>
          <textarea
            readOnly
            value={text}
            className="w-full h-48 p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
          />
        </div>
      )}
    </div>
  );
};

export default OcrUploader;
