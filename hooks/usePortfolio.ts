"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { getPortfolioHoldings, type AssetHolding } from "@/lib/holdings";
import { resolveTier, type TierResult } from "@/lib/tiers";
import { SUPPORTED_ASSETS, type AssetConfig } from "@/lib/assets";

type FetchStatus = "idle" | "loading" | "error";

type MarketHoursReading = {
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
} | null;

type PriceEntry = {
  source: "pyth" | "jupiter";
  price: number;
  updatedAtMs: number;
  stale: boolean;
  stockRef: number | null;
};

type PriceApiResponse = {
  prices?: Record<string, PriceEntry>;
  marketHours?: {
    aaplx: MarketHoursReading;
    aaplEquity: MarketHoursReading;
  };
};

export type AssetPosition = {
  asset: AssetConfig;
  uiAmount: number;
  price: PriceEntry | null;
  usdValue: number | null;
  tierResult: TierResult | null;
};

const PRICE_POLL_MS = 20_000;

/**
 * Portfolio completo (los 5 xStocks de lib/assets.ts) para la wallet activa
 * (conectada o "peekeada"): balance on-chain + precio (Jupiter, o Pyth para
 * AAPLx si hay clave) + tier por activo. Compartido entre el dashboard y el
 * marketplace para que ambos vean exactamente las mismas posiciones/tiers.
 */
export function usePortfolio() {
  const { connection } = useConnection();
  const { activeOwner } = useActiveOwner();

  const [holdings, setHoldings] = useState<AssetHolding[]>([]);
  const [holdingsStatus, setHoldingsStatus] = useState<FetchStatus>("idle");

  const [priceData, setPriceData] = useState<PriceApiResponse | null>(null);
  const [priceStatus, setPriceStatus] = useState<FetchStatus>("idle");

  useEffect(() => {
    if (!activeOwner) {
      return;
    }

    let cancelled = false;
    // Patrón estándar loading->fetch->idle/error con cleanup por `cancelled`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoldingsStatus("loading");

    getPortfolioHoldings(connection, activeOwner)
      .then((result) => {
        if (cancelled) return;
        setHoldings(result);
        setHoldingsStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setHoldingsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [connection, activeOwner]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      setPriceStatus((prev) => (prev === "idle" ? "loading" : prev));
      try {
        const res = await fetch("/api/price", { cache: "no-store" });
        const data = (await res.json()) as PriceApiResponse;
        if (cancelled) return;
        setPriceData(data);
        setPriceStatus("idle");
      } catch {
        if (cancelled) return;
        setPriceStatus("error");
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, PRICE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const effectiveHoldings = activeOwner ? holdings : [];
  const effectiveHoldingsStatus: FetchStatus = activeOwner ? holdingsStatus : "idle";

  const positions: AssetPosition[] = SUPPORTED_ASSETS.map((asset) => {
    const holding = effectiveHoldings.find((h) => h.asset.ticker === asset.ticker);
    const uiAmount = holding?.uiAmount ?? 0;
    const price = priceData?.prices?.[asset.ticker] ?? null;
    const usdValue = price ? uiAmount * price.price : null;
    const tierResult = usdValue !== null ? resolveTier(usdValue) : null;

    return { asset, uiAmount, price, usdValue, tierResult };
  });

  return {
    owner: activeOwner,
    positions,
    holdingsStatus: effectiveHoldingsStatus,
    priceStatus,
    marketHours: priceData?.marketHours ?? null,
  };
}
