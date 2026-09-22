import type { TierResult } from "@/lib/tiers";

export function TierMeter({
  tierResult,
  usdValue,
}: {
  tierResult: TierResult | null;
  usdValue: number | null;
}) {
  if (usdValue === null || !tierResult) return null;

  const { tier, nextTier, usdToNextTier } = tierResult;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Tu tier
        </span>
        <span className="rounded-full bg-violet-600/20 px-2.5 py-1 text-xs font-medium text-violet-300">
          {tier ? `${tier.label} · ${tier.discountPct}% dto.` : "Sin tier todavía"}
        </span>
      </div>

      {nextTier && usdToNextTier !== null && (
        <p className="mt-3 text-sm text-zinc-400">
          Te faltan{" "}
          <span className="font-medium text-zinc-200">
            {usdToNextTier.toLocaleString("es-ES", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </span>{" "}
          para {nextTier.label} ({nextTier.discountPct}% dto.)
        </p>
      )}

      {!nextTier && tier && (
        <p className="mt-3 text-sm text-emerald-400">
          Tier máximo desbloqueado.
        </p>
      )}
    </div>
  );
}
