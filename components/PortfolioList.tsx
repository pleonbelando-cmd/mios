import type { AssetPosition } from "@/hooks/usePortfolio";
import { TokenIcon } from "./TokenIcon";

function usd(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function PortfolioList({
  positions,
  status,
}: {
  positions: AssetPosition[];
  status: "idle" | "loading" | "error";
}) {
  if (status === "loading") {
    return (
      <p className="text-sm text-zinc-400">Leyendo tu portfolio on-chain…</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-red-400">
        No se pudo leer el portfolio. Revisa NEXT_PUBLIC_SOLANA_RPC_URL en
        .env.local.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-line">
      {positions.map(({ asset, uiAmount, usdValue, tierResult }, i) => {
        const held = uiAmount > 0;
        return (
          <div
            key={asset.ticker}
            className={`flex items-center gap-3 p-3 ${
              held ? "bg-ink-soft" : "bg-ink"
            } ${i > 0 ? "border-t border-ink-line" : ""}`}
          >
            <TokenIcon logoUrl={asset.logoUrl} ticker={asset.ticker} />

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${held ? "text-zinc-100" : "text-zinc-500"}`}
              >
                {asset.ticker}{" "}
                <span className="font-normal text-zinc-500">
                  · {asset.company}
                </span>
              </p>
              <p className="text-xs text-zinc-600">
                {held
                  ? `${uiAmount.toLocaleString("es-ES", { maximumFractionDigits: 4 })} ${asset.ticker}`
                  : "Sin posición"}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              {held && usdValue !== null && (
                <span className="text-sm font-semibold text-ember-400">
                  {usd(usdValue)}
                </span>
              )}
              {tierResult?.tier ? (
                <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                  {tierResult.tier.discountPct}% dto.
                </span>
              ) : (
                held && (
                  <span className="rounded-full bg-ink-line px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                    Sin tier
                  </span>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
