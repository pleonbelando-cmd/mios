"use client";

import { useMemo, useState } from "react";
import type { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectBar } from "@/components/ConnectBar";
import { WalletPeek } from "@/components/WalletPeek";
import { PositionCard } from "@/components/PositionCard";

export default function Home() {
  const { publicKey } = useWallet();
  const [peeked, setPeeked] = useState<PublicKey | null>(null);

  const activeOwner = useMemo(
    () => peeked ?? publicKey,
    [peeked, publicKey]
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <ConnectBar />

      <PositionCard owner={activeOwner} />

      <WalletPeek onChange={setPeeked} />

      {peeked && (
        <button
          onClick={() => setPeeked(null)}
          className="self-start text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          Volver a mi wallet conectada
        </button>
      )}
    </div>
  );
}
