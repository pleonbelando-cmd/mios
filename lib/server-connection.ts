import { Connection } from "@solana/web3.js";
import { FALLBACK_RPC_ENDPOINT } from "./constants";
export function getServerConnection() {
  return new Connection(
    process.env.SOLANA_RPC_URL ||
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      FALLBACK_RPC_ENDPOINT,
    {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
      fetch: (url, init) =>
        fetch(url, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  );
}
