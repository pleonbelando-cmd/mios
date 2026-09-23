"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectBar() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/aikkia-isotipo.svg" alt="" className="h-6 w-6" />
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-zinc-50">
            MIOS
          </span>
          <span className="gradient-solana mt-0.5 w-fit rounded-full px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-ink">
            Solana
          </span>
        </div>
      </div>
      <WalletMultiButton />
    </div>
  );
}
