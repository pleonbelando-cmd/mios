import type { PublicKey } from "@solana/web3.js";
import type { AaplxHolding } from "@/lib/holdings";

type Status = "idle" | "loading" | "error";

export function PositionCard({
  owner,
  holding,
  status,
  usdValue,
}: {
  owner: PublicKey | null;
  holding: AaplxHolding | null;
  status: Status;
  usdValue: number | null;
}) {
  if (!owner) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
        Conecta una wallet o usa el modo &quot;ver wallet&quot; para
        comprobar una posición en AAPLx.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="break-all text-xs text-zinc-500">{owner.toBase58()}</p>

      {status === "loading" && (
        <p className="mt-3 text-sm text-zinc-400">
          Leyendo balance on-chain…
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">
          No se pudo leer el balance. Revisa NEXT_PUBLIC_SOLANA_RPC_URL en
          .env.local.
        </p>
      )}

      {status === "idle" && holding && (
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold text-zinc-50">
            {holding.uiAmount.toLocaleString("es-ES", {
              maximumFractionDigits: 6,
            })}{" "}
            <span className="text-base font-normal text-zinc-500">AAPLx</span>
          </p>
          {usdValue !== null && (
            <p className="text-sm text-zinc-400">
              ≈{" "}
              {usdValue.toLocaleString("es-ES", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
