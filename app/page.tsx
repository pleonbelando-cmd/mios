"use client";

import Link from "next/link";
import { ConnectBar } from "@/components/ConnectBar";
import { WalletPeek } from "@/components/WalletPeek";
import { PositionCard } from "@/components/PositionCard";
import { TierMeter } from "@/components/TierMeter";
import { MarketClock } from "@/components/MarketClock";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { useAaplxPosition } from "@/hooks/useAaplxPosition";

export default function Home() {
  const { peeked, setPeeked } = useActiveOwner();
  const {
    owner,
    holding,
    holdingStatus,
    usdValue,
    tierResult,
    marketHours,
    priceSource,
    priceError,
  } = useAaplxPosition();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <ConnectBar />

      <MarketClock
        aaplx={marketHours?.aaplx ?? null}
        aaplEquity={marketHours?.aaplEquity ?? null}
      />

      <PositionCard
        owner={owner}
        holding={holding}
        status={holdingStatus}
        usdValue={usdValue}
      />

      {owner && priceSource === "jupiter" && (
        <p className="text-xs text-zinc-500">
          Precio en vivo vía Jupiter (Pyth Pro requiere plan de pago; se
          activa solo si configuras PYTH_API_KEY).
        </p>
      )}

      {owner && priceSource === "none" && (
        <p className="text-xs text-amber-400">
          No se pudo obtener el precio ({priceError}). El balance sí es real.
        </p>
      )}

      <TierMeter tierResult={tierResult} usdValue={usdValue} />

      <Link
        href="/store"
        className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center text-sm font-medium text-zinc-200 hover:border-violet-600 hover:text-violet-300"
      >
        Ir a Orchard Store →
      </Link>

      <WalletPeek onChange={setPeeked} />

      {peeked && (
        <button
          onClick={() => setPeeked(null)}
          className="self-start text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          Volver a mi wallet conectada
        </button>
      )}
    </div>
  );
}
