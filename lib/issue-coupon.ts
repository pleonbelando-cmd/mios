import { PublicKey } from "@solana/web3.js";
import { findAssetByTicker } from "./assets";
import { ApiError } from "./api-errors";
import { verifyChallenge } from "./challenge";
import { createCouponToken, type CouponLine } from "./coupon";
import { getPortfolioHoldings } from "./holdings";
import { getJupiterPrices } from "./jupiter";
import { isUsablePrice } from "./prices";
import { getServerConnection } from "./server-connection";
import { resolveTier } from "./tiers";
export async function issueCoupon(
  body: Record<string, unknown>,
  domain: string,
) {
  if (Object.keys(body).some((k) => k !== "challenge" && k !== "signature"))
    throw new ApiError(
      400,
      "Solo se admite el desafío y la firma. El servidor calcula el descuento.",
    );
  const challenge = verifyChallenge(body.challenge, body.signature, domain);
  const [holdings, prices] = await Promise.all([
    getPortfolioHoldings(
      getServerConnection(),
      new PublicKey(challenge.wallet),
    ).catch(() => {
      throw new ApiError(
        503,
        "No se pudo comprobar tu saldo. Inténtalo de nuevo.",
      );
    }),
    getJupiterPrices().catch(() => {
      throw new ApiError(
        503,
        "No se pudo consultar la cotización. Inténtalo de nuevo.",
      );
    }),
  ]);
  const lines: CouponLine[] = challenge.tickers.map((ticker) => {
    const price = prices[ticker];
    if (!isUsablePrice(price))
      throw new ApiError(
        503,
        "La cotización de " +
          ticker +
          " no está disponible o no es reciente. No se ha emitido el cupón.",
      );
    const amount = holdings.find((h) => h.asset.ticker === ticker)?.uiAmount;
    if (
      amount === undefined ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isFinite(amount * price.price)
    )
      throw new ApiError(503, "No se pudo validar el saldo.");
    const tier = resolveTier(amount * price.price).tier;
    return {
      ticker,
      company: findAssetByTicker(ticker)!.company,
      tierLabel: tier?.label ?? null,
      discountPct: tier?.discountPct ?? 0,
    };
  });
  const timestamp = Math.floor(Date.now() / 1000);
  if (challenge.expiresAt <= timestamp)
    throw new ApiError(
      401,
      "El desafío ha caducado. Vuelve a firmar con tu wallet.",
    );
  const token = createCouponToken({
    version: 2,
    demo: true,
    wallet: challenge.wallet,
    lines,
    timestamp,
  });
  return {
    token,
    lines,
    wallet: challenge.wallet,
    issuedAt: timestamp,
    expiresAt: timestamp + 86400,
    demo: true as const,
  };
}
