import { SUPPORTED_ASSETS } from "./assets";

/**
 * Fuente de precio en vivo GRATIS. Pyth Pro/Hermes requiere clave de pago
 * desde el Starter plan (500 $/mes) — no hay nivel gratuito con acceso API.
 * Jupiter Price API v3 SÍ es gratis sin clave en lite-api.jup.ag. Hasta 50
 * mints por llamada — los 5 activos soportados caben en una sola petición.
 */
const JUPITER_PRICE_ENDPOINT = "https://lite-api.jup.ag/price/v3";

export type JupiterAssetPrice = {
  ticker: string;
  usdPrice: number;
  /** Referencia del precio de la acción real que usa Jupiter internamente */
  stockRefPrice: number | null;
  updatedAtMs: number;
};

type JupiterPriceEntry = {
  usdPrice: number;
  stockData?: { price?: number; updatedAt?: string };
};

export async function getJupiterPrices(): Promise<
  Record<string, JupiterAssetPrice>
> {
  const ids = SUPPORTED_ASSETS.map((asset) => asset.mint.toBase58()).join(",");
  const res = await fetch(`${JUPITER_PRICE_ENDPOINT}?ids=${ids}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Jupiter price API respondió ${res.status}`);
  }

  const data = (await res.json()) as Record<string, JupiterPriceEntry>;
  const result: Record<string, JupiterAssetPrice> = {};

  for (const asset of SUPPORTED_ASSETS) {
    const entry = data[asset.mint.toBase58()];
    if (!entry) continue;
    result[asset.ticker] = {
      ticker: asset.ticker,
      usdPrice: entry.usdPrice,
      stockRefPrice: entry.stockData?.price ?? null,
      updatedAtMs: entry.stockData?.updatedAt
        ? new Date(entry.stockData.updatedAt).getTime()
        : Date.now(),
    };
  }

  return result;
}
