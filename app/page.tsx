"use client";

import Link from "next/link";
import { ConnectBar } from "@/components/ConnectBar";
import { WalletPeek } from "@/components/WalletPeek";
import { PortfolioList } from "@/components/PortfolioList";
import { MarketClock } from "@/components/MarketClock";
import { PremiumPanel } from "@/components/PremiumPanel";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { usePortfolio } from "@/hooks/usePortfolio";

export default function Home() {
  const { peeked, setPeeked } = useActiveOwner();
  const { owner, positions, holdingsStatus, marketHours } = usePortfolio();

  const aaplx = positions.find((p) => p.asset.ticker === "AAPLx");
  const anyJupiterPrice = positions.find((p) => p.price)?.price;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <ConnectBar />

      <MarketClock
        aaplx={marketHours?.aaplx ?? null}
        aaplEquity={marketHours?.aaplEquity ?? null}
      />

      {!owner && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
          Conecta una wallet o usa el modo &quot;ver wallet&quot; para ver tu
          portfolio de acciones tokenizadas y los descuentos que desbloquea
          en cada marca.
        </div>
      )}

      {owner && (
        <>
          <PortfolioList positions={positions} status={holdingsStatus} />

          {anyJupiterPrice?.source === "jupiter" && (
            <p className="text-xs text-zinc-500">
              Precio en vivo vía Jupiter (Pyth Pro requiere plan de pago; se
              activa solo si configuras PYTH_API_KEY).
            </p>
          )}
        </>
      )}

      <PremiumPanel
        aaplxPrice={aaplx?.price?.price ?? null}
        stockRefPrice={aaplx?.price?.stockRef ?? null}
      />

      <Link
        href="/store"
        className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center text-sm font-medium text-zinc-200 hover:border-violet-600 hover:text-violet-300"
      >
        Ir al marketplace →
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
