"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { getAaplxHolding, type AaplxHolding } from "@/lib/holdings";
import { resolveTier, type TierResult } from "@/lib/tiers";

type FetchStatus = "idle" | "loading" | "error";

type MarketHoursReading = {
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
} | null;

type PriceReading = {
  price: number;
  confidence: number;
  publishTimeMs: number;
  stale: boolean;
};

type PriceApiResponse = {
  configured: boolean;
  error?: string;
  aaplx?: PriceReading;
  marketHours?: {
    aaplx: MarketHoursReading;
    aaplEquity: MarketHoursReading;
  };
};

const PRICE_POLL_MS = 20_000;

/**
 * Combina balance on-chain (lib/holdings.ts) + precio de Pyth (app/api/price)
 * + tier (lib/tiers.ts) para la wallet activa (conectada o "peekeada").
 * Compartido entre el dashboard y la tienda para que ambos vean el mismo
 * tier/descuento sin duplicar el fetch.
 */
export function useAaplxPosition() {
  const { connection } = useConnection();
  const { activeOwner } = useActiveOwner();

  const [holding, setHolding] = useState<AaplxHolding | null>(null);
  const [holdingStatus, setHoldingStatus] = useState<FetchStatus>("idle");

  const [priceData, setPriceData] = useState<PriceApiResponse | null>(null);
  const [priceStatus, setPriceStatus] = useState<FetchStatus>("idle");

  useEffect(() => {
    if (!activeOwner) {
      // Sin owner no hay nada que pedir; el estado "vacío" se deriva más
      // abajo (effectiveHolding/effectiveHoldingStatus) en vez de resetear
      // aquí, para no disparar un setState síncrono dentro del efecto.
      return;
    }

    let cancelled = false;
    // Patrón estándar "loading -> fetch -> idle/error" con cleanup por
    // `cancelled`; react-hooks/set-state-in-effect lo marca, pero es el caso
    // legítimo que su propia doc describe como excepción (no hay lib de
    // data-fetching en este MVP de 3 días).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoldingStatus("loading");

    getAaplxHolding(connection, activeOwner)
      .then((result) => {
        if (cancelled) return;
        setHolding(result);
        setHoldingStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setHoldingStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [connection, activeOwner]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
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

    fetchPrice();
    const interval = setInterval(fetchPrice, PRICE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Sin owner activo, el balance de un owner anterior no debe seguir
  // mostrándose: se deriva el estado "vacío" en vez de resetearlo en el
  // efecto de arriba.
  const effectiveHolding = activeOwner ? holding : null;
  const effectiveHoldingStatus: FetchStatus = activeOwner ? holdingStatus : "idle";

  const usdValue =
    effectiveHolding && priceData?.aaplx
      ? effectiveHolding.uiAmount * priceData.aaplx.price
      : null;

  const tierResult: TierResult | null = usdValue !== null ? resolveTier(usdValue) : null;

  return {
    owner: activeOwner,
    holding: effectiveHolding,
    holdingStatus: effectiveHoldingStatus,
    price: priceData?.aaplx ?? null,
    priceConfigured: priceData?.configured ?? false,
    priceError: priceData?.error ?? null,
    priceStatus,
    marketHours: priceData?.marketHours ?? null,
    usdValue,
    tierResult,
  };
}
