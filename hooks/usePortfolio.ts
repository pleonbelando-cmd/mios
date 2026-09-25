"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { getPortfolioHoldings, type AssetHolding } from "@/lib/holdings";
import { resolveTier, type TierResult } from "@/lib/tiers";
import { SUPPORTED_ASSETS, type AssetConfig } from "@/lib/assets";
import {
  isUsablePrice,
  type PriceApiResponse,
  type PriceEntry,
} from "@/lib/prices";
export type FetchStatus = "idle" | "loading" | "error";
export type AssetPosition = {
  asset: AssetConfig;
  uiAmount: number;
  price: PriceEntry | null;
  usdValue: number | null;
  tierResult: TierResult | null;
};
const POLL_MS = 20_000;
type HoldingsState = {
  owner: string;
  connection: Connection;
  holdings: AssetHolding[];
  status: FetchStatus;
  at: number;
};
export function usePortfolio() {
  const { connection } = useConnection();
  const { activeOwner } = useActiveOwner();
  const ownerKey = activeOwner?.toBase58() ?? "";
  const [snapshot, setSnapshot] = useState<HoldingsState | null>(null);
  const [priceData, setPriceData] = useState<PriceApiResponse | null>(null);
  const [priceStatus, setPriceStatus] = useState<FetchStatus>("loading");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ownerKey) return;
    let cancelled = false,
      busy = false;
    async function refresh() {
      if (busy || cancelled) return;
      busy = true;
      setSnapshot({
        owner: ownerKey,
        connection,
        holdings: [],
        status: "loading",
        at: 0,
      });
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const holdings = await Promise.race([
          getPortfolioHoldings(connection, new PublicKey(ownerKey)),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), 10_000);
          }),
        ]);
        if (!cancelled)
          setSnapshot({
            owner: ownerKey,
            connection,
            holdings,
            status: "idle",
            at: Date.now(),
          });
      } catch {
        if (!cancelled)
          setSnapshot({
            owner: ownerKey,
            connection,
            holdings: [],
            status: "error",
            at: 0,
          });
      } finally {
        clearTimeout(timer);
        busy = false;
      }
    }
    void Promise.resolve().then(refresh);
    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [connection, ownerKey]);

  useEffect(() => {
    let cancelled = false,
      busy = false;
    const controller = new AbortController();
    async function refresh() {
      if (cancelled || busy) return;
      busy = true;
      setPriceStatus("loading");
      try {
        const res = await fetch("/api/price", {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(20_000),
          ]),
        });
        const data = (await res.json()) as PriceApiResponse;
        if (!res.ok || !data.prices || typeof data.prices !== "object")
          throw new Error();
        if (!cancelled) {
          setPriceData(data);
          setPriceStatus("idle");
          setNow(Date.now());
        }
      } catch {
        if (!cancelled) {
          setPriceData(null);
          setPriceStatus("error");
        }
      } finally {
        busy = false;
      }
    }
    void Promise.resolve().then(refresh);
    const interval = setInterval(refresh, POLL_MS);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
      clearInterval(clock);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const matching =
    snapshot?.owner === ownerKey && snapshot?.connection === connection;
  const holdingsStatus: FetchStatus = !ownerKey
    ? "idle"
    : !matching
      ? "loading"
      : snapshot.status === "idle" && now - snapshot.at > 30_000
        ? "loading"
        : snapshot.status;
  const holdings =
    ownerKey && matching && holdingsStatus === "idle" ? snapshot.holdings : [];
  const positions: AssetPosition[] = SUPPORTED_ASSETS.map((asset) => {
    const uiAmount =
      holdings.find((h) => h.asset.ticker === asset.ticker)?.uiAmount ?? 0;
    const price = priceData?.prices?.[asset.ticker] ?? null;
    const value = uiAmount * (price?.price ?? 0);
    const usdValue =
      !!ownerKey &&
      holdingsStatus === "idle" &&
      priceStatus === "idle" &&
      isUsablePrice(price, now) &&
      Number.isFinite(value)
        ? value
        : null;
    return {
      asset,
      uiAmount,
      price,
      usdValue,
      tierResult: usdValue === null ? null : resolveTier(usdValue),
    };
  });
  return {
    owner: activeOwner,
    positions,
    holdingsStatus,
    priceStatus,
    marketHours: priceData?.marketHours ?? null,
  };
}
