import { AAPLX_FEED_ID, getLatestPrices, getMarketHours } from "@/lib/pyth";
import { getJupiterPrices } from "@/lib/jupiter";
import { jsonResponse } from "@/lib/api-errors";
import { isUsablePrice, type PriceEntry } from "@/lib/prices";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const [aaplx, aaplEquity, prices] = await Promise.all([
    getMarketHours("Crypto.AAPLX/USD").catch(() => null),
    getMarketHours("Equity.US.AAPL/USD").catch(() => null),
    getJupiterPrices().catch(() => ({}) as Record<string, PriceEntry>),
  ]);
  if (process.env.PYTH_API_KEY) {
    try {
      const p = (await getLatestPrices([AAPLX_FEED_ID]))[AAPLX_FEED_ID];
      if (p && !p.stale && Number.isFinite(p.price) && p.price > 0) {
        prices.AAPLx = {
          source: "pyth",
          price: p.price,
          fetchedAtMs: Date.now(),
          sourceUpdatedAtMs: p.publishTimeMs,
          stale: p.stale,
          stockRef: prices.AAPLx?.stockRef ?? null,
          stockRefUpdatedAtMs: prices.AAPLx?.stockRefUpdatedAtMs ?? null,
        };
      }
    } catch {
      /* Keep Jupiter as fallback. */
    }
  }
  const available = Object.values(prices).some((p) => isUsablePrice(p));
  return jsonResponse(
    {
      prices,
      marketHours: { aaplx, aaplEquity },
      ...(available
        ? {}
        : {
            error:
              "No hay cotizaciones recientes disponibles. Vuelve a intentarlo.",
          }),
    },
    available ? 200 : 503,
  );
}
