import { NextResponse } from "next/server";
import {
  AAPLX_FEED_ID,
  getLatestPrices,
  getMarketHours,
} from "@/lib/pyth";

// El paquete @pythnetwork/hermes-client depende de `eventsource` y de
// Node 24; no es apto para Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [marketHoursAaplx, marketHoursAapl] = await Promise.all([
    getMarketHours("Crypto.AAPLX/USD"),
    getMarketHours("Equity.US.AAPL/USD"),
  ]);

  const marketHours = { aaplx: marketHoursAaplx, aaplEquity: marketHoursAapl };

  if (!process.env.PYTH_API_KEY) {
    return NextResponse.json({
      configured: false,
      error: "PYTH_API_KEY no configurada en .env.local",
      marketHours,
    });
  }

  try {
    const prices = await getLatestPrices([AAPLX_FEED_ID]);
    const aaplx = prices[AAPLX_FEED_ID];

    if (!aaplx) {
      return NextResponse.json(
        { configured: true, error: "Pyth no devolvió precio para AAPLx", marketHours },
        { status: 502 }
      );
    }

    return NextResponse.json({ configured: true, aaplx, marketHours });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        error: error instanceof Error ? error.message : "Error consultando Pyth",
        marketHours,
      },
      { status: 502 }
    );
  }
}
