type MarketHoursReading = {
  isOpen: boolean;
  nextOpen: number | null;
  nextClose: number | null;
} | null;

function formatWhen(unixSeconds: number | null): string | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toLocaleString("es-ES", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Momento clave del pitch: AAPLx cotiza 24/7, la acción real no. */
export function MarketClock({
  aaplx,
  aaplEquity,
}: {
  aaplx: MarketHoursReading;
  aaplEquity: MarketHoursReading;
}) {
  if (!aaplx && !aaplEquity) return null;

  const nextOpen = formatWhen(aaplEquity?.nextOpen ?? null);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={`rounded-full px-2.5 py-1 font-medium ${
          aaplx?.isOpen
            ? "bg-solana-green/15 text-solana-green"
            : "bg-ink-line text-zinc-400"
        }`}
      >
        AAPLx {aaplx?.isOpen ? "cotizando 24/7" : "sin datos"}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 font-medium ${
          aaplEquity?.isOpen
            ? "bg-solana-green/15 text-solana-green"
            : "bg-ink-line text-zinc-500"
        }`}
      >
        NYSE (AAPL real){" "}
        {aaplEquity?.isOpen ? "abierto" : `cerrado${nextOpen ? ` · abre ${nextOpen}` : ""}`}
      </span>
    </div>
  );
}
