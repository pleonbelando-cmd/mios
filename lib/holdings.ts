import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SUPPORTED_ASSETS, findAssetByMint, type AssetConfig } from "./assets";

export type AssetHolding = {
  asset: AssetConfig;
  uiAmount: number;
};

type ParsedTokenAccountInfo = {
  mint: string;
  tokenAmount: {
    uiAmount: number | null;
    decimals: number;
  };
};

/**
 * Balance de todos los xStocks soportados (lib/assets.ts) para una wallet,
 * leído on-chain en UNA sola llamada (todas las cuentas Token-2022 del
 * owner, filtradas client-side por los mints que nos interesan). Añadir más
 * activos no encarece esta llamada: el coste ya está pagado por leer todas
 * las cuentas Token-2022 del owner, sea cual sea el número de activos que
 * sigamos.
 *
 * Cada mint es Token-2022 con extensión scaledUiAmount (ajuste por
 * dividendos): usar SIEMPRE `tokenAmount.uiAmount`, nunca `amount` crudo.
 * Si una wallet reparte el balance de un mismo mint en varias cuentas
 * (bots, custodia), se suman todas — no coger solo la primera.
 */
export async function getPortfolioHoldings(
  connection: Connection,
  owner: PublicKey
): Promise<AssetHolding[]> {
  const { value } = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_2022_PROGRAM_ID,
  });

  const totals = new Map<string, number>();
  for (const entry of value) {
    const info = entry.account.data.parsed.info as ParsedTokenAccountInfo;
    const asset = findAssetByMint(info.mint);
    if (!asset) continue;
    const current = totals.get(asset.ticker) ?? 0;
    totals.set(asset.ticker, current + (info.tokenAmount.uiAmount ?? 0));
  }

  return SUPPORTED_ASSETS.map((asset) => ({
    asset,
    uiAmount: totals.get(asset.ticker) ?? 0,
  }));
}
