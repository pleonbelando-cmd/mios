import { PublicKey } from "@solana/web3.js";

export type AssetConfig = {
  /** Ticker del xStock, p.ej. "AAPLx" */
  ticker: string;
  mint: PublicKey;
  decimals: number;
  /** Nombre real del xStock (metadata on-chain) */
  displayName: string;
  /** Marca FICTICIA que "premia" a los holders de este activo — nunca una
   * marca real, por los mismos motivos que Orchard para AAPLx (ver CLAUDE.md §3). */
  brand: string;
  brandTagline: string;
};

/**
 * Los 5 mints están verificados on-chain (22/09/2026, vía Helius):
 * Token-2022, 8 decimales, mismo perfil de extensiones que AAPLx
 * (incluye ScaledUiAmountConfig — usar siempre uiAmount, nunca `amount`
 * crudo), sin transferHook activo, nombre/símbolo de metadata confirmados.
 * No añadir un activo nuevo aquí sin repetir esa verificación.
 */
export const SUPPORTED_ASSETS: AssetConfig[] = [
  {
    ticker: "AAPLx",
    mint: new PublicKey("XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp"),
    decimals: 8,
    displayName: "Apple xStock",
    brand: "Orchard",
    brandTagline: "Auriculares, fundas y accesorios",
  },
  {
    ticker: "NVDAx",
    mint: new PublicKey("Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh"),
    decimals: 8,
    displayName: "NVIDIA xStock",
    brand: "Vertex Labs",
    brandTagline: "Periféricos y renderizado en la nube",
  },
  {
    ticker: "TSLAx",
    mint: new PublicKey("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB"),
    decimals: 8,
    displayName: "Tesla xStock",
    brand: "Volt Motors",
    brandTagline: "Movilidad eléctrica y accesorios de carga",
  },
  {
    ticker: "SPYx",
    mint: new PublicKey("XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W"),
    decimals: 8,
    displayName: "SP500 xStock",
    brand: "Index & Co.",
    brandTagline: "Artículos de vida financiera diversificada",
  },
  {
    ticker: "GOOGLx",
    mint: new PublicKey("XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN"),
    decimals: 8,
    displayName: "Alphabet xStock",
    brand: "Compass Digital",
    brandTagline: "Navegación, nube y accesorios de viaje",
  },
];

export function findAssetByMint(mint: string): AssetConfig | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.mint.toBase58() === mint);
}

export function findAssetByTicker(ticker: string): AssetConfig | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.ticker === ticker);
}
