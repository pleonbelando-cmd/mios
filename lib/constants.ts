import { PublicKey } from "@solana/web3.js";

/**
 * Apple xStock (Backed Finance), Token-2022, 8 decimales.
 * Verificado on-chain contra la metadata del mint (name: "Apple xStock").
 * Tiene extensión scaledUiAmount (ajuste por dividendos): usar SIEMPRE
 * tokenAmount.uiAmount de getParsedTokenAccountsByOwner, nunca el `amount`
 * crudo dividido por 10^decimals.
 */
export const AAPLX_MINT = new PublicKey(
  "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp"
);

export const AAPLX_DECIMALS = 8;

export const FALLBACK_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
