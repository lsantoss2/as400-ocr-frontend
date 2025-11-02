// Analizador robusto para pantallas AS400 (Trabajos activos)

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
  
  export function analyzeAS400Text(rawText) {
    if (!rawText) return { registros: [], resumen: { total: 0 }, usuarios: {}, estados: {} };
  
    // 1) Normalización
    const cleanedLines = rawText
      .replace(/\u00A0/g, " ")
      .replace(/[^\S\r\n]+/g, " ")
      .replace(/[‐-‒–—―]/g, "-")
      .split("\n")
      .map((l) => l.trim().replace(/^[^A-Z0-9]+/, "")) // quita '_' 'a ' etc.
      .filter((l) => l.length > 0 && !isHeaderOrFooter(l));
  
    const registros = [];
  
    // 2) Regex principal (6 columnas)
    // Ej: VAPMON01 BCOGBCULA BCH .0 PGM-AUP320 DEQW
    const mainRx =
      /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+([.\d]+)\s+([A-Z0-9-]+)\s+([A-Z]+)\s*$/;
  
    // 3) Fallback tolerante (variaciones en %CPU)
    const fallbackRx =
      /^\s*([A-Z0-9]+)\s+([A-Z0-9]+)\s+([A-Z]{3})\s+[.:]?\s*([0-9]+(?:[.,][0-9]+)?)\s+([A-Z0-9-]+)\s+([A-Z]+)\s*$/;
  
    for (const line of cleanedLines) {
      const m = line.match(mainRx) || line.match(fallbackRx);
      if (!m) continue;
      const [, trabajo, usuario, tipo, cpu, funcion, estado] = m;
      registros.push({ trabajo, usuario, tipo, cpu, funcion, estado });
    }
  
    // 4) Conteos
    const resumen = { total: registros.length };
    const usuarios = {};
    const estados = {};
    for (const r of registros) {
      if (r.usuario) usuarios[r.usuario] = (usuarios[r.usuario] || 0) + 1;
      if (r.estado) estados[r.estado] = (estados[r.estado] || 0) + 1;
    }
  
    return { registros, resumen, usuarios, estados };
  }
  