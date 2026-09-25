"use client";

import QRCode from "react-qr-code";
import type { CouponLine } from "@/lib/coupon";

export function Coupon({
  verifyUrl,
  lines,
}: {
  verifyUrl: string;
  lines: CouponLine[];
}) {
  return (
    <div className="rounded-xl border border-ink-line bg-ink-soft p-5 text-center">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        Cupón de demostración
      </p>

      <div className="mt-2 flex flex-col gap-1">
        {lines.map((line) => (
          <p key={line.ticker} className="text-sm text-zinc-300">
            <span className="font-semibold text-teal-300">
              {line.discountPct}%
            </span>{" "}
            {line.company}{" "}
            <span className="text-zinc-500">({line.ticker})</span>
          </p>
        ))}
      </div>

      <div className="mx-auto mt-4 w-fit rounded-lg bg-white p-3">
        <QRCode value={verifyUrl} size={160} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-300">
        Escanea para verificar la firma y la posición acreditada al emitir.
        Caduca en 24 horas. No es canjeable ni de uso único; no representa una
        compra.
      </p>
      <a
        href={verifyUrl}
        className="mt-4 inline-block text-sm text-brand-300 underline"
      >
        Abrir verificación del cupón
      </a>
    </div>
  );
}
