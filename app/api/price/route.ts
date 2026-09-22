import { NextResponse } from "next/server";
import { AAPLX_FEED_ID, getLatestPrices, getMarketHours } from "@/lib/pyth";
import { getJupiterAaplxPrice } from "@/lib/jupiter";

// @pythnetwork/hermes-client depende de `eventsource` y de Node 24; no vale
// para Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [marketHoursAaplx, marketHoursAapl] = await Promise.all([
    getMarketHours("Crypto.AAPLX/USD"),
    getMarketHours("Equity.US.AAPL/USD"),
  ]);
  const marketHours = { aaplx: marketHoursAaplx, aaplEquity: marketHoursAapl };

  // Pyth Hermes requiere clave de pago (Starter, 500 $/mes) desde el Core
  // upgrade del 26/08/2026 — no hay nivel gratuito con acceso API. Si algún
  // día hay clave configurada (p.ej. al ganar el bounty), se usa Pyth de
  // verdad; si no, se cae a Jupiter (gratis, sin clave, mismo precio DEX
  // real al que se compra/vende AAPLx).
  if (process.env.PYTH_API_KEY) {
    try {
      const prices = await getLatestPrices([AAPLX_FEED_ID]);
      const aaplx = prices[AAPLX_FEED_ID];
      if (aaplx) {
        return NextResponse.json({
          source: "pyth",
          aaplx: { price: aaplx.price, updatedAtMs: aaplx.publishTimeMs, stale: aaplx.stale },
          stockRef: null,
          marketHours,
        });
      }
    } catch {
      // cae a Jupiter más abajo
    }
  }

  try {
    const jupiter = await getJupiterAaplxPrice();
    return NextResponse.json({
      source: "jupiter",
      aaplx: { price: jupiter.usdPrice, updatedAtMs: jupiter.updatedAtMs, stale: false },
      stockRef: jupiter.stockRefPrice,
      marketHours,
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "none",
        error: error instanceof Error ? error.message : "Error consultando el precio",
        marketHours,
      },
      { status: 502 }
    );
  }
}
