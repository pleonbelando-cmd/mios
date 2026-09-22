import { AAPLX_MINT } from "./constants";

/**
 * Fuente de precio en vivo GRATIS para AAPLx. Pyth Pro/Hermes requiere clave
 * de pago desde el Starter plan (500 $/mes) — no hay nivel gratuito con
 * acceso API (solo el Terminal, view-only). Verificado el 22/09/2026 contra
 * app.pyth.com/plans y en vivo (401 sin clave en ambos endpoints de Hermes).
 * Jupiter Price API v3 SÍ es gratis sin clave en lite-api.jup.ag.
 */
const JUPITER_PRICE_ENDPOINT = "https://lite-api.jup.ag/price/v3";

export type JupiterAaplxPrice = {
  /** Precio de mercado (DEX) de AAPLx en USD */
  usdPrice: number;
  /** Referencia del precio de la acción real que usa Jupiter internamente */
  stockRefPrice: number | null;
  liquidityUsd: number | null;
  updatedAtMs: number;
};

type JupiterPriceEntry = {
  usdPrice: number;
  liquidity?: number;
  stockData?: { price?: number; updatedAt?: string };
};

export async function getJupiterAaplxPrice(): Promise<JupiterAaplxPrice> {
  const url = `${JUPITER_PRICE_ENDPOINT}?ids=${AAPLX_MINT.toBase58()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Jupiter price API respondió ${res.status}`);
  }

  const data = (await res.json()) as Record<string, JupiterPriceEntry>;
  const entry = data[AAPLX_MINT.toBase58()];
  if (!entry) {
    throw new Error("Jupiter no devolvió precio para AAPLx");
  }

  return {
    usdPrice: entry.usdPrice,
    stockRefPrice: entry.stockData?.price ?? null,
    liquidityUsd: entry.liquidity ?? null,
    updatedAtMs: entry.stockData?.updatedAt
      ? new Date(entry.stockData.updatedAt).getTime()
      : Date.now(),
  };
}
