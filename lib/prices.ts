export type PriceEntry = {
  source: "pyth" | "jupiter";
  price: number;
  fetchedAtMs: number;
  sourceUpdatedAtMs: number | null;
  stale: boolean;
  stockRef: number | null;
  stockRefUpdatedAtMs: number | null;
};
export type MarketHoursReading = {
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
} | null;
export type PriceApiResponse = {
  prices: Record<string, PriceEntry>;
  marketHours?: { aaplx: MarketHoursReading; aaplEquity: MarketHoursReading };
};
export const PRICE_MAX_AGE_MS = 120_000;
export function isUsablePrice(
  price: PriceEntry | null | undefined,
  now = Date.now(),
): price is PriceEntry {
  return (
    !!price &&
    Number.isFinite(price.price) &&
    price.price > 0 &&
    price.stale === false &&
    Number.isFinite(price.fetchedAtMs) &&
    now - price.fetchedAtMs <= PRICE_MAX_AGE_MS &&
    price.fetchedAtMs <= now + 30_000 &&
    price.sourceUpdatedAtMs !== null &&
    Number.isFinite(price.sourceUpdatedAtMs) &&
    now - price.sourceUpdatedAtMs <= PRICE_MAX_AGE_MS &&
    price.sourceUpdatedAtMs <= now + 30_000
  );
}
