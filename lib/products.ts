export type Product = {
  id: string;
  name: string;
  priceUsd: number;
  blurb: string;
};

/**
 * Marca y productos ficticios a propósito (ver CLAUDE.md §3): la acción
 * tokenizada verificada es real, la tienda que la premia es un mockup.
 */
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Auriculares Orchard One",
    priceUsd: 89,
    blurb: "Cancelación de ruido, 30h de batería.",
  },
  {
    id: "p2",
    name: "Funda Orchard Slim",
    priceUsd: 29,
    blurb: "Piel vegana, ajuste magnético.",
  },
  {
    id: "p3",
    name: "Cargador Orchard Fast 65W",
    priceUsd: 45,
    blurb: "Carga completa en 40 minutos.",
  },
  {
    id: "p4",
    name: "Orchard+ (suscripción anual)",
    priceUsd: 99,
    blurb: "Contenido y soporte prioritario.",
  },
];
