import { HermesClient } from "@pythnetwork/hermes-client";

/**
 * Feed IDs verificados contra /v2/price_feeds el 22/09/2026. No reinventar:
 * un ID equivocado rompe la demo en silencio (Pyth no valida IDs desconocidos
 * con un error claro).
 */
export const AAPLX_FEED_ID =
  "0x978e6cc68a119ce066aa830017318563a9ed04ec3a0a6439010fc11296a58675";
export const AAPL_EQUITY_FEED_ID =
  "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688";
export const AAPLX_RR_FEED_ID =
  "0x25babb83691a056fd65f879bfd7197eabd840aae741f69c87ccb31e204a979b2";

// Pyth Core upgrade (26/08/2026): el endpoint legacy hermes.pyth.network da
// 401 sin clave para precios. Este SÍ funciona con accessToken.
const HERMES_PRICE_ENDPOINT = "https://pyth.dourolabs.app/hermes";

// El endpoint de metadatos (/v2/price_feeds) sigue respondiendo sin clave en
// el dominio legacy — verificado en vivo. Lo usamos solo para market_hours,
// que no depende de tener PYTH_API_KEY configurada.
const HERMES_METADATA_ENDPOINT = "https://hermes.pyth.network/v2/price_feeds";

const STALE_AFTER_MS = 120_000;

export type PriceReading = {
  price: number;
  confidence: number;
  publishTimeMs: number;
  stale: boolean;
};

type ParsedPriceUpdate = {
  id: string;
  price: { price: string; conf: string; expo: number; publish_time: number };
};

function withPrefix(id: string): string {
  return id.startsWith("0x") ? id : `0x${id}`;
}

function toPriceReading({ price, conf, expo, publish_time }: ParsedPriceUpdate["price"]): PriceReading {
  const scale = 10 ** expo;
  const publishTimeMs = publish_time * 1000;
  return {
    price: Number(price) * scale,
    confidence: Number(conf) * scale,
    publishTimeMs,
    stale: Date.now() - publishTimeMs > STALE_AFTER_MS,
  };
}

/**
 * Server-only: requiere PYTH_API_KEY. No importar desde un componente
 * cliente (la clave se filtraría al bundle).
 */
export async function getLatestPrices(
  feedIds: string[]
): Promise<Record<string, PriceReading>> {
  const accessToken = process.env.PYTH_API_KEY;
  if (!accessToken) {
    throw new Error("PYTH_API_KEY no configurada en .env.local");
  }

  const client = new HermesClient(HERMES_PRICE_ENDPOINT, { accessToken });
  const updates = await client.getLatestPriceUpdates(feedIds, { parsed: true });

  const result: Record<string, PriceReading> = {};
  for (const update of (updates.parsed ?? []) as ParsedPriceUpdate[]) {
    result[withPrefix(update.id)] = toPriceReading(update.price);
  }
  return result;
}

export type MarketHours = {
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
};

/** Sin API key: endpoint de metadatos público de Pyth. */
export async function getMarketHours(symbol: string): Promise<MarketHours | null> {
  const url = `${HERMES_METADATA_ENDPOINT}?query=${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const feeds = (await res.json()) as Array<{
    attributes?: { symbol?: string };
    market_hours?: { is_open: boolean; next_open: number | null; next_close: number | null };
  }>;

  const match = feeds.find((feed) => feed.attributes?.symbol === symbol) ?? feeds[0];
  if (!match?.market_hours) return null;

  return {
    isOpen: match.market_hours.is_open,
    nextOpen: match.market_hours.next_open,
    nextClose: match.market_hours.next_close,
  };
}
