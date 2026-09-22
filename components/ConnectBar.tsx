"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-lg font-semibold tracking-tight text-zinc-50">
        MIOS
      </span>
      <WalletMultiButton />
    </div>
  );
}
