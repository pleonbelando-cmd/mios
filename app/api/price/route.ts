import { NextResponse } from "next/server";
import { AAPLX_FEED_ID, getLatestPrices, getMarketHours } from "@/lib/pyth";
import { getJupiterPrices } from "@/lib/jupiter";

// @pythnetwork/hermes-client depende de `eventsource` y de Node 24; no vale
// para Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PriceEntry = {
  source: "pyth" | "jupiter";
  price: number;
  updatedAtMs: number;
  stale: boolean;
  stockRef: number | null;
};

export async function GET() {
  const [marketHoursAaplx, marketHoursAapl, jupiterPrices] = await Promise.all([
    getMarketHours("Crypto.AAPLX/USD"),
    getMarketHours("Equity.US.AAPL/USD"),
    getJupiterPrices().catch(() => ({})),
  ]);
  const marketHours = { aaplx: marketHoursAaplx, aaplEquity: marketHoursAapl };

  const prices: Record<string, PriceEntry> = {};
  for (const [ticker, entry] of Object.entries(jupiterPrices)) {
    prices[ticker] = {
      source: "jupiter",
      price: entry.usdPrice,
      updatedAtMs: entry.updatedAtMs,
      stale: false,
      stockRef: entry.stockRefPrice,
    };
  }

  // AAPLx es el activo del bounty de Pyth: si hay PYTH_API_KEY de pago
  // configurada, prioriza el precio real de Hermes sobre Jupiter para ese
  // activo (el resto del catálogo se queda con Jupiter, gratis).
  if (process.env.PYTH_API_KEY) {
    try {
      const pythPrices = await getLatestPrices([AAPLX_FEED_ID]);
      const aaplx = pythPrices[AAPLX_FEED_ID];
      if (aaplx) {
        prices.AAPLx = {
          source: "pyth",
          price: aaplx.price,
          updatedAtMs: aaplx.publishTimeMs,
          stale: aaplx.stale,
          stockRef: prices.AAPLx?.stockRef ?? null,
        };
      }
    } catch {
      // se queda con el precio de Jupiter que ya está en `prices`
    }
  }

  return NextResponse.json({ prices, marketHours });
}
