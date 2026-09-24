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
  const { owner, positions, holdingsStatus, priceStatus, marketHours } =
    usePortfolio();
  const aapl = positions.find((p) => p.asset.ticker === "AAPLx");
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-7">
      <ConnectBar />
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          Stocklana · Demo en Solana
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Tu cartera.
          <br />
          Más posibilidades.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
          MIOS verifica tus acciones tokenizadas y muestra las ventajas de
          compra que un comercio podría ofrecerte.
        </p>
      </div>
      <ol
        className="flex gap-3 border-y border-ink-line py-4 text-xs text-zinc-300"
        aria-label="Cómo funciona"
      >
        <li className="flex-1">
          <span className="mb-1 block text-teal-300">01</span>Conecta tu wallet
        </li>
        <li className="flex-1">
          <span className="mb-1 block text-teal-300">02</span>Descubre
          beneficios
        </li>
        <li className="flex-1">
          <span className="mb-1 block text-teal-300">03</span>Verifica tu cupón
        </li>
      </ol>
      {owner ? (
        <section aria-label="Cartera">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tu posición en Solana</h2>
            <span className="text-xs text-teal-300">
              {peeked ? "Consulta · solo lectura" : "Wallet conectada"}
            </span>
          </div>
          <p className="mb-3 break-all text-xs text-zinc-400">
            {owner.toBase58()}
          </p>
          <PortfolioList positions={positions} status={holdingsStatus} />
          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
            Datos reales. Actualización cada 20 segundos. Cada activo desbloquea
            su propio beneficio de demostración.
          </p>
        </section>
      ) : (
        <p className="rounded-xl border border-ink-line bg-ink-soft p-4 text-sm leading-relaxed text-zinc-300">
          Conecta una wallet para acreditar tu posición o consulta una dirección
          pública en modo de solo lectura.
        </p>
      )}
      {priceStatus === "error" && (
        <p role="alert" className="text-sm text-red-300">
          Las cotizaciones no están disponibles. Los beneficios permanecerán
          desactivados hasta poder verificarlas.
        </p>
      )}
      <Link
        href="/store"
        className="rounded-xl bg-brand-600 px-4 py-3.5 text-center text-sm font-semibold text-white hover:bg-brand-500"
      >
        Explorar beneficios de demostración →
      </Link>
      <p className="-mt-3 text-xs text-zinc-400">
        Sin pagos ni movimientos de fondos. Campañas de ejemplo, sin acuerdos
        con las marcas.
      </p>
      <MarketClock
        aaplx={marketHours?.aaplx ?? null}
        aaplEquity={marketHours?.aaplEquity ?? null}
      />
      {aapl?.usdValue !== null && priceStatus === "idle" && (
        <PremiumPanel
          aaplxPrice={aapl?.price?.price ?? null}
          stockRefPrice={aapl?.price?.stockRef ?? null}
        />
      )}
      <p className="text-xs text-zinc-400">
        Valoración de cupones: Jupiter. Horarios de mercado: Pyth. La referencia
        bursátil puede corresponder al último cierre.
      </p>
      <WalletPeek onChange={setPeeked} />
      {peeked && (
        <button
          onClick={() => setPeeked(null)}
          className="self-start text-sm text-brand-300 underline"
        >
          Volver a mi wallet conectada
        </button>
      )}
      <Link href="/example" className="text-sm text-brand-300 underline">
        Ver un ejemplo ilustrativo sin wallet
      </Link>
    </main>
  );
}
