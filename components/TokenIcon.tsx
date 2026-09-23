"use client";

import { useState } from "react";

/**
 * Icono oficial del xStock (metadata pública de Backed, el emisor —
 * ver lib/assets.ts). Si la imagen no carga, cae a un círculo con las
 * iniciales del ticker en vez de romper el layout.
 */
export function TokenIcon({
  logoUrl,
  ticker,
  size = 36,
}: {
  logoUrl: string;
  ticker: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full bg-ink-line text-[10px] font-semibold text-zinc-400"
      >
        {ticker.replace(/x$/, "").slice(0, 4)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={ticker}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}
