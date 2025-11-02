// Analizador robusto para pantallas AS400 (American Express)

const HEADER_PATTERNS = [
  /Trabajar con trabajos activos/i,
  /Tiempo transcurrido/i,
  /Trab activos/i,
  /^Opc/i,
  /Subsistema/i,
  /Usuario\s+actual/i,
  /Tipo/i,
  /%?\s*CPU/i,
  /Función/i,
  /Estado/i,
  /^Final$/i,
  /^===>/i,
  /^F\d{1,2}=/i,
];

/**
 * Verifica si una línea es encabezado o pie de página
 */
function isHeaderOrFooter(line) {
  return HEADER_PATTERNS.some((rx) => rx.test(line));
}

/**
 * Analiza texto OCR extraído de pantallas AS400 (AMEX)
 * @param {string} rawText Texto reconocido por OCR
 */
export function analyzeAmexText(rawText) {
  if (!rawText) {
    return {
      tipo: "AMEX",
      registros: [],
      resumen: { total: 0 },
      usuarios: {},
      estados: {},
    };
  }

  // 1️⃣ Normalización del texto
  const cleanedLines = rawText
    .replace(/\u00A0/g, " ") // reemplaza espacios no separables
    .replace(/[^\S\r\n]+/g, " ") // normaliza múltiples espacios
    .replace(/[‐-‒–—―]/g, "-") // normaliza guiones
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isHeaderOrFooter(l));

  const registros = [];

  // 2️⃣ Expresiones regulares principales
  // Ejemplo esperado:
  // AUC306AMX BCOGHLUN BCH .0 PGM-AUC306G DEQW
  const mainRx =
    /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+([.\d]+)\s+(PGM-[A-Z0-9]+)\s+([A-Z]+)\s*$/;

  // Variante más flexible (por si OCR omite puntos o separaciones)
  const fallbackRx =
    /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+[.:]?\s*([0-9]+(?:[.,][0-9]+)?)\s+(PGM-[A-Z0-9]+)\s+([A-Z]+)\s*$/;

  // 3️⃣ Extracción de registros válidos
  for (const line of cleanedLines) {
    const m = line.match(mainRx) || line.match(fallbackRx);
    if (!m) continue;
    const [, trabajo, usuario, tipo, cpu, funcion, estado] = m;
    registros.push({ trabajo, usuario, tipo, cpu, funcion, estado });
  }

  // 4️⃣ Generar resumen y conteos
  const resumen = { total: registros.length };
  const usuarios = {};
  const estados = {};

  for (const r of registros) {
    if (r.usuario) usuarios[r.usuario] = (usuarios[r.usuario] || 0) + 1;
    if (r.estado) estados[r.estado] = (estados[r.estado] || 0) + 1;
  }

  return { tipo: "AMEX", registros, resumen, usuarios, estados };
}
