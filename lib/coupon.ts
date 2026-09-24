import { findAssetByTicker } from "./assets";
import { parseWallet } from "./challenge";
import { readSignedToken, signToken } from "./signed-token";
import { TIERS } from "./tiers";
export type CouponLine = {
  ticker: string;
  company: string;
  tierLabel: string | null;
  discountPct: number;
};
export type CouponPayload = {
  version: 2;
  demo: true;
  wallet: string;
  lines: CouponLine[];
  timestamp: number;
};
export type VerifyResult =
  { valid: true; payload: CouponPayload } | { valid: false; reason: string };
export function createCouponToken(payload: CouponPayload) {
  return signToken("mios-coupon-v2", payload);
}
export function verifyCouponToken(
  token: string,
  now = Math.floor(Date.now() / 1000),
): VerifyResult {
  try {
    const payload = readSignedToken("mios-coupon-v2", token) as CouponPayload;
    if (
      !payload ||
      payload.version !== 2 ||
      payload.demo !== true ||
      !Number.isSafeInteger(payload.timestamp) ||
      payload.timestamp > now + 30 ||
      !Array.isArray(payload.lines) ||
      !payload.lines.length ||
      payload.lines.length > 5
    )
      throw new Error();
    parseWallet(payload.wallet);
    if (
      new Set(payload.lines.map((l) => l?.ticker)).size !== payload.lines.length
    )
      throw new Error();
    for (const line of payload.lines) {
      const asset = findAssetByTicker(line?.ticker);
      const validTier =
        line?.discountPct === 0
          ? line.tierLabel === null
          : TIERS.some(
              (t) =>
                t.label === line?.tierLabel &&
                t.discountPct === line?.discountPct,
            );
      if (!asset || line.company !== asset.company || !validTier)
        throw new Error();
    }
    if (now - payload.timestamp >= 86400)
      return {
        valid: false,
        reason: "Cupón caducado (24 horas desde la emisión).",
      };
    return { valid: true, payload };
  } catch {
    return {
      valid: false,
      reason:
        "Cupón no válido. Puede estar manipulado o pertenecer a una versión anterior de la demo.",
    };
  }
}
