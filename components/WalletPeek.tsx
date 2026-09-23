"use client";

import { useState, type FormEvent } from "react";
import { PublicKey } from "@solana/web3.js";

export function WalletPeek({
  onChange,
}: {
  onChange: (owner: PublicKey | null) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError(null);
      onChange(null);
      return;
    }

    try {
      onChange(new PublicKey(trimmed));
      setError(null);
    } catch {
      setError("Esa dirección no es una clave pública de Solana válida.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="peek-address" className="text-xs text-zinc-500">
        Modo ver wallet — pega cualquier dirección pública
      </label>
      <div className="flex gap-2">
        <input
          id="peek-address"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Dirección de Solana"
          className="min-w-0 flex-1 rounded-lg border border-ink-line bg-ink-soft px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          Ver
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
