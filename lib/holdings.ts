import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { AAPLX_DECIMALS, AAPLX_MINT } from "./constants";

export type AaplxHolding = {
  mint: string;
  uiAmount: number;
  decimals: number;
};

type ParsedTokenAccountInfo = {
  mint: string;
  tokenAmount: {
    uiAmount: number | null;
    decimals: number;
  };
};

/**
 * Balance real de AAPLx para una wallet, leído on-chain.
 * AAPLx es Token-2022: hay que consultar con TOKEN_2022_PROGRAM_ID (el
 * programa SPL clásico no lo ve). uiAmount ya viene escalado por el RPC
 * (aplica el multiplicador de scaledUiAmount), así que es el valor correcto
 * a mostrar sin más cálculos.
 */
export async function getAaplxHolding(
  connection: Connection,
  owner: PublicKey
): Promise<AaplxHolding> {
  const { value } = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_2022_PROGRAM_ID,
  });

  const mintBase58 = AAPLX_MINT.toBase58();
  // La mayoría de wallets (Phantom, etc.) tienen una única ATA por mint, pero
  // algunas cuentas (bots, custodia, omnibus) reparten el balance en varias
  // cuentas de token para el mismo mint. Hay que sumarlas todas, no coger
  // solo la primera — un `.find()` aquí infrarrepresentaría el balance real.
  const infos = value
    .map((entry) => entry.account.data.parsed.info as ParsedTokenAccountInfo)
    .filter((info) => info.mint === mintBase58);

  const uiAmount = infos.reduce(
    (sum, info) => sum + (info.tokenAmount.uiAmount ?? 0),
    0
  );

  return {
    mint: mintBase58,
    uiAmount,
    decimals: infos[0]?.tokenAmount.decimals ?? AAPLX_DECIMALS,
  };
}
