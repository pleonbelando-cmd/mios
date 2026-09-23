import { PublicKey } from "@solana/web3.js";

export type AssetConfig = {
  /** Ticker del xStock, p.ej. "AAPLx" */
  ticker: string;
  mint: PublicKey;
  decimals: number;
  /** Nombre real del xStock (metadata on-chain) */
  displayName: string;
  /** Empresa/índice real que representa el activo — ver CLAUDE.md §16:
   * decisión consciente (23/09/2026) de mostrar nombre y logo reales. */
  company: string;
  companyTagline: string;
  /** Icono oficial del token, publicado por Backed (el emisor del xStock) en
   * su propio dominio de metadata — el mismo logo que muestra cualquier
   * wallet o exchange para este mint. No es un asset de marca de terceros. */
  logoUrl: string;
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
    company: "Apple",
    companyTagline: "Tecnología y dispositivos personales",
    logoUrl: "https://xstocks-metadata.backed.fi/logos/tokens/AAPLx.png",
  },
  {
    ticker: "NVDAx",
    mint: new PublicKey("Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh"),
    decimals: 8,
    displayName: "NVIDIA xStock",
    company: "NVIDIA",
    companyTagline: "Computación gráfica e inteligencia artificial",
    logoUrl: "https://xstocks-metadata.backed.fi/logos/tokens/NVDAx.png",
  },
  {
    ticker: "TSLAx",
    mint: new PublicKey("XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB"),
    decimals: 8,
    displayName: "Tesla xStock",
    company: "Tesla",
    companyTagline: "Movilidad eléctrica y energía",
    logoUrl: "https://xstocks-metadata.backed.fi/logos/tokens/TSLAx.png",
  },
  {
    ticker: "SPYx",
    mint: new PublicKey("XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W"),
    decimals: 8,
    displayName: "SP500 xStock",
    company: "S&P 500",
    companyTagline: "Cesta diversificada de las 500 mayores empresas de EE. UU.",
    logoUrl: "https://xstocks-metadata.backed.fi/logos/tokens/SPYx.png",
  },
  {
    ticker: "GOOGLx",
    mint: new PublicKey("XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN"),
    decimals: 8,
    displayName: "Alphabet xStock",
    company: "Alphabet",
    companyTagline: "Búsqueda, nube e inteligencia artificial",
    logoUrl: "https://xstocks-metadata.backed.fi/logos/tokens/GOOGLx.png",
  },
];

export function findAssetByMint(mint: string): AssetConfig | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.mint.toBase58() === mint);
}

export function findAssetByTicker(ticker: string): AssetConfig | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.ticker === ticker);
}
