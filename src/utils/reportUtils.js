import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateAS400Report(analysis, marca = "VISA") {
  const { registros, resumen, usuarios, estados } = analysis;
  const doc = new jsPDF();

  // === 🕒 Datos de fecha y nombre de archivo ===
  const fecha = new Date();
  const fechaFormateada = fecha.toLocaleString("es-GT", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const nombreArchivo = `Monitoreo_${fecha.toISOString().split("T")[0]}_${marca}.pdf`;

  // === 🎨 Colores corporativos BAC Credomatic ===
  const rojoBAC = [200, 16, 46]; // #C8102E
  const azulBAC = [0, 34, 68];   // #002244
  const verdeBAC = [0, 122, 51]; // #007A33

  // === 🏦 Encabezado general ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(rojoBAC[0], rojoBAC[1], rojoBAC[2]);
  doc.text("BAC Credomatic - Informe OCR AS400", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(50);
  doc.text(`Marca analizada: ${marca}`, 14, 28);
  doc.text(`Fecha de generación: ${fechaFormateada}`, 14, 36);
  doc.text(`Total de trabajos: ${resumen?.total || 0}`, 14, 44);

  // === 📊 Tabla de Estados ===
  const estadosRows = Object.entries(estados || {}).map(([estado, count]) => [estado, count]);
  autoTable(doc, {
    startY: 52,
    head: [["Estado", "Cantidad"]],
    body: estadosRows.length ? estadosRows : [["(sin datos)", 0]],
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: azulBAC,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableLineWidth: 0.1,
  });

  // === 👤 Tabla de Usuarios ===
  const afterEstadosY = doc.lastAutoTable.finalY + 10;
  const usuariosRows = Object.entries(usuarios || {}).map(([usuario, count]) => [usuario, count]);
  autoTable(doc, {
    startY: afterEstadosY,
    head: [["Usuario", "Cantidad de trabajos"]],
    body: usuariosRows.length ? usuariosRows : [["(sin datos)", 0]],
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: verdeBAC,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableLineWidth: 0.1,
  });

  // === 📋 Tabla de Detalle de trabajos ===
  const afterUsuariosY = doc.lastAutoTable.finalY + 10;
  const detalleRows = (registros || []).map((r) => [
    r.trabajo || "N/A",
    r.usuario || "N/A",
    r.estado || "N/A",
    r.funcion || "N/A",
  ]);

  autoTable(doc, {
    startY: afterUsuariosY,
    head: [["Trabajo", "Usuario", "Estado", "Función"]],
    body: detalleRows.length ? detalleRows : [["-", "-", "-", "-"]],
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: rojoBAC,
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: { 3: { cellWidth: 80 } },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    tableLineWidth: 0.1,
  });

  // === 🦶 Pie de página institucional ===
  const pageHeight = doc.internal.pageSize.height;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Sistema OCR BAC Credomatic — Generado automáticamente por el módulo de monitoreo AS400.",
    14,
    pageHeight - 15
  );

  // === 💾 Guardar archivo ===
  doc.save(nombreArchivo);
}
