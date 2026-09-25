import Link from "next/link";
import { verifyCouponToken } from "@/lib/coupon";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c: raw } = await searchParams;
  const c = typeof raw === "string" ? raw : undefined;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <Link
        href="/"
        className="text-xs text-zinc-500 underline hover:text-brand-300"
      >
        ← Dashboard
      </Link>

      {!c ? (
        <p className="text-sm text-zinc-400">Falta el código del cupón.</p>
      ) : (
        <VerifyResult token={c} />
      )}
    </div>
  );
}

function VerifyResult({ token }: { token: string }) {
  const result = verifyCouponToken(token);

  if (!result.valid) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/40 p-5 text-center">
        <p className="text-lg font-semibold text-red-300">Cupón no válido</p>
        <p className="mt-2 text-sm text-zinc-400">{result.reason}</p>
      </div>
    );
  }

  const { payload } = result;

  return (
    <div className="rounded-xl border border-solana-green/40 bg-solana-green/10 p-5 text-center">
      <p className="text-lg font-semibold text-solana-green">
        Firma válida · Cupón de demostración
      </p>
      <p className="mt-3 text-sm text-zinc-300">
        La wallet acreditó su control y cumplía estas condiciones al emitir. No
        se vuelve a consultar el saldo al abrir este enlace. Sin pago, canje
        comercial ni garantía de uso único.
      </p>

      <div className="mt-3 flex flex-col gap-1">
        {payload.lines.map((line) => (
          <p key={line.ticker} className="text-sm text-zinc-200">
            <span className="font-semibold">{line.discountPct}%</span>{" "}
            {line.company}{" "}
            <span className="text-zinc-500">({line.ticker})</span>
          </p>
        ))}
      </div>

      <p className="mt-3 break-all text-xs text-zinc-300">{payload.wallet}</p>
      <p className="mt-1 text-xs text-zinc-300">
        Emitido:{" "}
        {new Date(payload.timestamp * 1000).toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        })}{" "}
        UTC · Caducidad: 24 horas.
      </p>
    </div>
  );
}
