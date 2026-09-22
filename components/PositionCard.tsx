"use client";

import { useEffect, useState } from "react";
import type { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { getAaplxHolding, type AaplxHolding } from "@/lib/holdings";

type Status = "idle" | "loading" | "error";

export function PositionCard({ owner }: { owner: PublicKey | null }) {
  const { connection } = useConnection();
  const [holding, setHolding] = useState<AaplxHolding | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!owner) {
      setHolding(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    getAaplxHolding(connection, owner)
      .then((result) => {
        if (cancelled) return;
        setHolding(result);
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [connection, owner]);

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
        <p className="mt-3 text-3xl font-semibold text-zinc-50">
          {holding.uiAmount.toLocaleString("es-ES", {
            maximumFractionDigits: 6,
          })}{" "}
          <span className="text-base font-normal text-zinc-500">AAPLx</span>
        </p>
      )}
    </div>
  );
}
