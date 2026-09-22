export type Product = {
  id: string;
  /** Ticker del xStock cuyo tier desbloquea el descuento en este producto */
  ticker: string;
  name: string;
  priceUsd: number;
  blurb: string;
};

/**
 * Marcas y productos ficticios a propósito (CLAUDE.md §3): las acciones
 * tokenizadas verificadas son reales, las marcas que premian a sus holders
 * son un mockup — una por cada activo de lib/assets.ts.
 */
export const PRODUCTS: Product[] = [
  // Orchard — AAPLx
  { id: "orchard-1", ticker: "AAPLx", name: "Auriculares Orchard One", priceUsd: 89, blurb: "Cancelación de ruido, 30h de batería." },
  { id: "orchard-2", ticker: "AAPLx", name: "Funda Orchard Slim", priceUsd: 29, blurb: "Piel vegana, ajuste magnético." },
  { id: "orchard-3", ticker: "AAPLx", name: "Cargador Orchard Fast 65W", priceUsd: 45, blurb: "Carga completa en 40 minutos." },

  // Vertex Labs — NVDAx
  { id: "vertex-1", ticker: "NVDAx", name: "Monitor Vertex RT 4K", priceUsd: 429, blurb: "144Hz, HDR, ideal para renderizado." },
  { id: "vertex-2", ticker: "NVDAx", name: "Base de refrigeración Vertex Chill", priceUsd: 39, blurb: "Para portátiles de alto rendimiento." },
  { id: "vertex-3", ticker: "NVDAx", name: "Vertex Render Credits (pack)", priceUsd: 59, blurb: "Horas de renderizado en la nube." },

  // Volt Motors — TSLAx
  { id: "volt-1", ticker: "TSLAx", name: "Cargador portátil Volt Fast", priceUsd: 79, blurb: "Carga rápida para el día a día." },
  { id: "volt-2", ticker: "TSLAx", name: "Kit de limpieza Volt Shine", priceUsd: 25, blurb: "Cuidado exterior e interior." },
  { id: "volt-3", ticker: "TSLAx", name: "Llavero Volt", priceUsd: 15, blurb: "Edición holder." },

  // Index & Co. — SPYx
  { id: "index-1", ticker: "SPYx", name: "Cartera de piel Index", priceUsd: 55, blurb: "Diseño minimalista." },
  { id: "index-2", ticker: "SPYx", name: "Agenda Index Planner", priceUsd: 22, blurb: "Planificación financiera anual." },
  { id: "index-3", ticker: "SPYx", name: "Index+ (newsletter anual)", priceUsd: 40, blurb: "Análisis de mercado semanal." },

  // Compass Digital — GOOGLx
  { id: "compass-1", ticker: "GOOGLx", name: "Compass Nav (GPS de viaje)", priceUsd: 65, blurb: "Navegación offline global." },
  { id: "compass-2", ticker: "GOOGLx", name: "Auriculares Compass Clear", priceUsd: 49, blurb: "Traducción en tiempo real." },
  { id: "compass-3", ticker: "GOOGLx", name: "Compass Cloud (1 año)", priceUsd: 35, blurb: "Almacenamiento y backup." },
];
