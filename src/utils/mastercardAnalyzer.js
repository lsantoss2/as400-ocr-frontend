// Analizador para pantallas AS400 - Trabajos Mastercard
// Incluye chequeo de subsistemas críticos L3 y L6

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
  
  function isHeaderOrFooter(line) {
    return HEADER_PATTERNS.some((rx) => rx.test(line));
  }
  
  export function analyzeMastercardText(rawText) {
    if (!rawText)
      return {
        registros: [],
        resumen: { total: 0 },
        usuarios: {},
        estados: {},
        especiales: {},
      };
  
    // 1️⃣ Limpieza general del texto
    const cleanedLines = rawText
      .replace(/\u00A0/g, " ")
      .replace(/[^\S\r\n]+/g, " ")
      .replace(/[‐-‒–—―]/g, "-")
      .split("\n")
      .map((l) => l.trim().replace(/^[^A-Z0-9]+/, ""))
      .filter((l) => l.length > 0 && !isHeaderOrFooter(l));
  
    const registros = [];
  
    // 2️⃣ Patrones de reconocimiento
    const mainRx =
      /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+([.\d]+)\s+([A-Z0-9-]+)\s+([A-Z]+)\s*$/;
    const fallbackRx =
      /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+[.:]?\s*([0-9]+(?:[.,][0-9]+)?)\s+([A-Z0-9-]+)\s+([A-Z]+)\s*$/;
  
    // 3️⃣ Procesar líneas y filtrar solo trabajos Mastercard
    // Los trabajos Mastercard comienzan con MCC, L3 o L6
    for (const line of cleanedLines) {
      const m = line.match(mainRx) || line.match(fallbackRx);
      if (!m) continue;
      const [, trabajo, usuario, tipo, cpu, funcion, estado] = m;
  
      if (!/^MCC|^L3|^L6/i.test(trabajo)) continue;
  
      registros.push({ trabajo, usuario, tipo, cpu, funcion, estado });
    }
  
    // 4️⃣ Generar conteos
    const resumen = { total: registros.length };
    const usuarios = {};
    const estados = {};
    registros.forEach((r) => {
      if (r.usuario) usuarios[r.usuario] = (usuarios[r.usuario] || 0) + 1;
      if (r.estado) estados[r.estado] = (estados[r.estado] || 0) + 1;
    });
  
    // 5️⃣ Detección especial de subsistemas L3 / L6
    const especiales = { L3: "No detectado", L6: "No detectado" };
  
    for (const r of registros) {
      if (r.trabajo.startsWith("L3")) {
        especiales.L3 = ["SELW", "DEQA"].includes(r.estado)
          ? "Activo"
          : "Inactivo";
      }
      if (r.trabajo.startsWith("L6")) {
        especiales.L6 = ["SELW", "DEQA"].includes(r.estado)
          ? "Activo"
          : "Inactivo";
      }
    }
  
    return { registros, resumen, usuarios, estados, tipo: "MASTERCARD", especiales };
  }
  