import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateAS400Report(analysis) {
  const { registros, resumen, usuarios, estados } = analysis;
  const doc = new jsPDF();

  // Encabezado
  doc.setFontSize(16);
  doc.text("Informe OCR - Sistema AS400", 14, 18);

  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 26);
  doc.text(`Total de trabajos: ${resumen.total}`, 14, 34);

  // Tabla: Estados
  const estadosRows = Object.entries(estados).map(([estado, count]) => [estado, count]);
  autoTable(doc, {
    startY: 42,
    head: [["Estado", "Cantidad"]],
    body: estadosRows.length ? estadosRows : [["(sin datos)", 0]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 144, 255] },
    tableLineWidth: 0.1,
  });

  // Tabla: Usuarios
  const afterEstadosY = doc.lastAutoTable.finalY + 8;
  const usuariosRows = Object.entries(usuarios).map(([usuario, count]) => [usuario, count]);
  autoTable(doc, {
    startY: afterEstadosY,
    head: [["Usuario", "Cantidad de trabajos"]],
    body: usuariosRows.length ? usuariosRows : [["(sin datos)", 0]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
    tableLineWidth: 0.1,
  });

  // Tabla: Detalle (Trabajo–Usuario–Estado–Función)
  const afterUsuariosY = doc.lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY: afterUsuariosY,
    head: [["Trabajo", "Usuario", "Estado", "Función"]],
    body: registros.map((r) => [r.trabajo, r.usuario, r.estado, r.funcion]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [70, 70, 70] },
    columnStyles: { 3: { cellWidth: 70 } },
    tableLineWidth: 0.1,
  });

  doc.save("Resumen_AS400.pdf");
}
