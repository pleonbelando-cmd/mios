import type { AssetPosition } from "@/hooks/usePortfolio";
import { TokenIcon } from "./TokenIcon";
import { TIERS } from "@/lib/tiers";
const usd = (n: number) =>
  n.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
export function PortfolioList({
  positions,
  status,
}: {
  positions: AssetPosition[];
  status: "idle" | "loading" | "error";
}) {
  if (status === "loading")
    return (
      <p role="status" className="text-sm text-zinc-300">
        Comprobando tu cartera en Solana…
      </p>
    );
  if (status === "error")
    return (
      <p role="alert" className="text-sm text-red-300">
        No hemos podido leer la cartera. Volveremos a intentarlo
        automáticamente; también puedes volver a esta ventana para actualizar.
      </p>
    );
  return (
    <div className="overflow-hidden rounded-xl border border-ink-line">
      {positions.map(({ asset, uiAmount, usdValue, tierResult }) => {
        const next = tierResult?.nextTier;
        const target = next?.minUsd ?? TIERS[TIERS.length - 1].minUsd;
        const progress =
          usdValue === null ? 0 : Math.min(100, (usdValue / target) * 100);
        return (
          <div
            key={asset.ticker}
            className="border-b border-ink-line bg-ink-soft p-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <TokenIcon logoUrl={asset.logoUrl} ticker={asset.ticker} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {asset.ticker}{" "}
                  <span className="text-xs font-normal text-zinc-400">
                    · {asset.company}
                  </span>
                </p>
                <p className="text-xs text-zinc-300">
                  {uiAmount.toLocaleString("es-ES", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  tokens
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ember-400">
                  {usdValue === null ? "—" : usd(usdValue)}
                </p>
                <p className="text-xs text-teal-300">
                  {tierResult?.tier
                    ? tierResult.tier.discountPct + "% de beneficio demo"
                    : usdValue === null
                      ? "Valoración pendiente"
                      : "Sin beneficio aún"}
                </p>
              </div>
            </div>
            {usdValue !== null && (
              <div className="mt-3">
                <progress
                  aria-label={"Progreso del beneficio de " + asset.ticker}
                  max={100}
                  value={progress}
                  className="h-1.5 w-full accent-teal-400"
                />
                <p className="mt-1 text-xs text-zinc-300">
                  {next
                    ? "Faltan " +
                      usd(tierResult!.usdToNextTier!) +
                      " para el " +
                      next.discountPct +
                      "%."
                    : "Nivel máximo de la campaña de ejemplo."}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
