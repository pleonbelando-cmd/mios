"use client";

import QRCode from "react-qr-code";

export function Coupon({
  verifyUrl,
  discountPct,
  tierLabel,
}: {
  verifyUrl: string;
  discountPct: number;
  tierLabel: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        Cupón verificable
      </p>
      <p className="mt-1 text-2xl font-semibold text-violet-300">
        {discountPct}% dto.
      </p>
      <p className="text-xs text-zinc-500">{tierLabel}</p>
      <div className="mx-auto mt-4 w-fit rounded-lg bg-white p-3">
        <QRCode value={verifyUrl} size={160} />
      </div>
      <p className="mt-3 text-[10px] text-zinc-600">
        Escanea para verificar la firma. Válido 24h.
      </p>
    </div>
  );
}
