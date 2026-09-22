function usd(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

/**
 * Compara el precio de mercado de AAPLx con la referencia de la acción real
 * que da Jupiter (`stockData.price`) — mismo dato que costaría un feed de
 * pago de Pyth (Crypto.AAPLX/AAPL.RR), gratis.
 */
export function PremiumPanel({
  aaplxPrice,
  stockRefPrice,
}: {
  aaplxPrice: number | null;
  stockRefPrice: number | null;
}) {
  if (aaplxPrice === null || stockRefPrice === null) return null;

  const diffPct = ((aaplxPrice - stockRefPrice) / stockRefPrice) * 100;
  const isPremium = diffPct >= 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        AAPLx vs AAPL real
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-zinc-500">AAPLx (token)</p>
          <p className="text-lg font-semibold text-zinc-50">{usd(aaplxPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">AAPL (referencia)</p>
          <p className="text-lg font-semibold text-zinc-300">
            {usd(stockRefPrice)}
          </p>
        </div>
      </div>
      <p
        className={`mt-2 text-sm font-medium ${
          isPremium ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {isPremium ? "Prima" : "Descuento"} de {Math.abs(diffPct).toFixed(2)}%
        vs la acción real
      </p>
    </div>
  );
}
