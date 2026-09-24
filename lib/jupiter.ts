import { SUPPORTED_ASSETS } from "./assets";
import { getServerConnection } from "./server-connection";
import { isUsablePrice, type PriceEntry } from "./prices";
type JupiterEntry = {
  usdPrice?: number;
  blockId?: number;
  stockData?: { price?: number; updatedAt?: string };
};
export async function getJupiterPrices(): Promise<Record<string, PriceEntry>> {
  const ids = SUPPORTED_ASSETS.map((a) => a.mint.toBase58()).join(",");
  const endpoint = process.env.JUPITER_API_KEY
    ? "https://api.jup.ag/price/v3"
    : "https://lite-api.jup.ag/price/v3";
  const res = await fetch(endpoint + "?ids=" + ids, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: process.env.JUPITER_API_KEY
      ? { "x-api-key": process.env.JUPITER_API_KEY }
      : undefined,
  });
  if (!res.ok) throw new Error("Price service unavailable");
  const data = (await res.json()) as Record<string, JupiterEntry | null>;
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid prices");
  const fetchedAtMs = Date.now();
  const blocks = [
    ...new Set(
      SUPPORTED_ASSETS.map((a) => data[a.mint.toBase58()]?.blockId).filter(
        (b): b is number => Number.isSafeInteger(b) && b! > 0,
      ),
    ),
  ];
  const connection = getServerConnection();
  // stockData.updatedAt describes the equity reference, not the token's last swap.
  // Jupiter documents blockId as the recency signal. Unknown age fails closed.
  const times = new Map(
    await Promise.all(
      blocks.map(
        async (block) =>
          [
            block,
            await connection.getBlockTime(block).catch(() => null),
          ] as const,
      ),
    ),
  );
  const result: Record<string, PriceEntry> = {};
  for (const asset of SUPPORTED_ASSETS) {
    const entry = data[asset.mint.toBase58()];
    if (
      !entry ||
      typeof entry.usdPrice !== "number" ||
      !Number.isFinite(entry.usdPrice) ||
      entry.usdPrice <= 0
    )
      continue;
    const blockTime = entry.blockId ? times.get(entry.blockId) : null;
    const refDate = entry.stockData?.updatedAt
      ? Date.parse(entry.stockData.updatedAt)
      : NaN;
    const price: PriceEntry = {
      source: "jupiter",
      price: entry.usdPrice,
      fetchedAtMs,
      sourceUpdatedAtMs:
        typeof blockTime === "number" ? blockTime * 1000 : null,
      stale: false,
      stockRef:
        typeof entry.stockData?.price === "number" &&
        Number.isFinite(entry.stockData.price) &&
        entry.stockData.price > 0
          ? entry.stockData.price
          : null,
      stockRefUpdatedAtMs: Number.isFinite(refDate) ? refDate : null,
    };
    price.stale = !isUsablePrice(price);
    result[asset.ticker] = price;
  }
  return result;
}
