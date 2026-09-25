export type Tier = {
  id: number;
  label: string;
  minUsd: number;
  discountPct: number;
};

export const TIERS: Tier[] = [
  { id: 1, label: "Tier 1", minUsd: 500, discountPct: 5 },
  { id: 2, label: "Tier 2", minUsd: 2000, discountPct: 10 },
  { id: 3, label: "Tier 3", minUsd: 10000, discountPct: 15 },
];

export type TierResult = {
  tier: Tier | null;
  nextTier: Tier | null;
  usdToNextTier: number | null;
};

/** Config editable en un solo sitio: valor USD de la posición -> tier + descuento. */
export function resolveTier(usdValue: number): TierResult {
  if (!Number.isFinite(usdValue) || usdValue < 0)
    return { tier: null, nextTier: null, usdToNextTier: null };
  let current: Tier | null = null;
  for (const tier of TIERS) {
    if (usdValue >= tier.minUsd) current = tier;
  }

  const nextTier =
    TIERS.find((tier) => current === null || tier.minUsd > current.minUsd) ??
    null;

  return {
    tier: current,
    nextTier,
    usdToNextTier: nextTier ? Math.max(0, nextTier.minUsd - usdValue) : null,
  };
}
