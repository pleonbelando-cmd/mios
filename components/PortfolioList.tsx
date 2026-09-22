import type { AssetPosition } from "@/hooks/usePortfolio";

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
    <div className="flex flex-col gap-2">
      {positions.map(({ asset, uiAmount, usdValue, tierResult }) => {
        const held = uiAmount > 0;
        return (
          <div
            key={asset.ticker}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
              held
                ? "border-zinc-800 bg-zinc-900/50"
                : "border-zinc-900 bg-zinc-950/30"
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${held ? "text-zinc-100" : "text-zinc-600"}`}
              >
                {asset.ticker}{" "}
                <span className="font-normal text-zinc-500">
                  · {asset.brand}
                </span>
              </p>
              <p className="text-xs text-zinc-600">
                {held
                  ? `${uiAmount.toLocaleString("es-ES", { maximumFractionDigits: 4 })} ${asset.ticker}${
                      usdValue !== null ? ` · ${usd(usdValue)}` : ""
                    }`
                  : "Sin posición"}
              </p>
            </div>
            {tierResult?.tier ? (
              <span className="shrink-0 rounded-full bg-violet-600/20 px-2.5 py-1 text-xs font-medium text-violet-300">
                {tierResult.tier.discountPct}% dto.
              </span>
            ) : (
              held && (
                <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500">
                  Sin tier
                </span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
