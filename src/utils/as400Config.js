// src/utils/as400Config.js

export const AS400_FILTERS = {
    VISA: {
      prefix: /^VAP/i, // Ejemplo: VAPMON, VAPSND, VAPR
      label: "VISA",
    },
    MASTERCARD: {
      prefix: /^MAP/i, // Ejemplo: MAPMON, MAPSND, MAPRCV
      label: "MASTERCARD",
    },
    AMEX: {
      prefix: /^AAP/i, // Ejemplo: AAPMON, AAPSND, AAPRCV
      label: "AMERICAN EXPRESS",
    },
  };
  