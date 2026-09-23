export type Product = {
  id: string;
  /** Ticker del xStock cuyo tier desbloquea el descuento en este producto */
  ticker: string;
  name: string;
  priceUsd: number;
  blurb: string;
};

/**
 * Catálogo de demo del marketplace, agrupado por empresa real (lib/assets.ts,
 * ver CLAUDE.md §16). Los productos en sí son accesorios genéricos — no
 * réplicas de productos oficiales de cada compañía — para que quede claro
 * que es un beneficio de fidelidad para holders, no una tienda oficial de
 * Apple/NVIDIA/Tesla/etc.
 */
export const PRODUCTS: Product[] = [
  // Apple — AAPLx
  { id: "aaplx-1", ticker: "AAPLx", name: "Auriculares inalámbricos", priceUsd: 89, blurb: "Cancelación de ruido, 30h de batería." },
  { id: "aaplx-2", ticker: "AAPLx", name: "Funda protectora", priceUsd: 29, blurb: "Piel vegana, ajuste magnético." },
  { id: "aaplx-3", ticker: "AAPLx", name: "Cargador rápido 65W", priceUsd: 45, blurb: "Carga completa en 40 minutos." },

  // NVIDIA — NVDAx
  { id: "nvdax-1", ticker: "NVDAx", name: "Monitor 4K 144Hz", priceUsd: 429, blurb: "HDR, ideal para renderizado." },
  { id: "nvdax-2", ticker: "NVDAx", name: "Base de refrigeración", priceUsd: 39, blurb: "Para portátiles de alto rendimiento." },
  { id: "nvdax-3", ticker: "NVDAx", name: "Créditos de renderizado en la nube", priceUsd: 59, blurb: "Pack de horas de cómputo GPU." },

  // Tesla — TSLAx
  { id: "tslax-1", ticker: "TSLAx", name: "Cargador portátil rápido", priceUsd: 79, blurb: "Carga rápida para el día a día." },
  { id: "tslax-2", ticker: "TSLAx", name: "Kit de limpieza para el coche", priceUsd: 25, blurb: "Cuidado exterior e interior." },
  { id: "tslax-3", ticker: "TSLAx", name: "Llavero edición holder", priceUsd: 15, blurb: "Edición limitada para holders." },

  // S&P 500 — SPYx
  { id: "spyx-1", ticker: "SPYx", name: "Cartera de piel", priceUsd: 55, blurb: "Diseño minimalista." },
  { id: "spyx-2", ticker: "SPYx", name: "Agenda de planificación financiera", priceUsd: 22, blurb: "Planificación financiera anual." },
  { id: "spyx-3", ticker: "SPYx", name: "Newsletter de mercado (anual)", priceUsd: 40, blurb: "Análisis de mercado semanal." },

  // Alphabet — GOOGLx
  { id: "googlx-1", ticker: "GOOGLx", name: "GPS de viaje offline", priceUsd: 65, blurb: "Navegación offline global." },
  { id: "googlx-2", ticker: "GOOGLx", name: "Auriculares con traducción", priceUsd: 49, blurb: "Traducción en tiempo real." },
  { id: "googlx-3", ticker: "GOOGLx", name: "Almacenamiento en la nube (1 año)", priceUsd: 35, blurb: "Almacenamiento y backup." },
];
