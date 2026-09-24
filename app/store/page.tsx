"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { PRODUCTS } from "@/lib/products";
import { SUPPORTED_ASSETS } from "@/lib/assets";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useActiveOwner } from "@/contexts/ActiveOwnerContext";
import { Coupon } from "@/components/Coupon";
import { TokenIcon } from "@/components/TokenIcon";
import { requestCoupon, type CouponResult } from "@/lib/request-coupon";
const usd = (n: number) =>
  n.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
export default function StorePage() {
  const { activeOwner, connectedOwner, peeked } = useActiveOwner();
  return (
    <StoreSession
      key={[activeOwner?.toBase58(), connectedOwner?.toBase58(), !!peeked].join(
        ":",
      )}
    />
  );
}
function StoreSession() {
  const { owner, positions, holdingsStatus, priceStatus } = usePortfolio();
  const { connectedOwner, peeked } = useActiveOwner();
  const { signMessage } = useWallet();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CouponResult | null>(null);
  const [stage, setStage] = useState<"idle" | "signing" | "checking">("idle");
  const [error, setError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const items = PRODUCTS.filter((p) => (cart[p.id] ?? 0) > 0).map(
    (product) => ({ product, qty: cart[product.id] }),
  );
  const tickers = [...new Set(items.map((i) => i.product.ticker))];
  const ready =
    holdingsStatus === "idle" &&
    priceStatus === "idle" &&
    tickers.every(
      (t) => positions.find((p) => p.asset.ticker === t)?.usdValue != null,
    );
  const ownWallet =
    !!owner && !!connectedOwner && owner.equals(connectedOwner) && !peeked;
  const canIssue =
    ownWallet && !!signMessage && ready && items.length > 0 && stage === "idle";
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.priceUsd * i.qty,
    0,
  );
  const discountFor = (ticker: string) =>
    result
      ? (result.lines.find((l) => l.ticker === ticker)?.discountPct ?? 0)
      : ready
        ? (positions.find((p) => p.asset.ticker === ticker)?.tierResult?.tier
            ?.discountPct ?? 0)
        : 0;
  const total = items.reduce(
    (sum, i) =>
      sum +
      i.product.priceUsd * i.qty * (1 - discountFor(i.product.ticker) / 100),
    0,
  );
  function change(id: string, delta: number) {
    setError("");
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(99, (prev[id] ?? 0) + delta)),
    }));
  }
  async function confirm() {
    if (!canIssue || !owner || !signMessage || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setError("");
    setStage("signing");
    try {
      const issued = await requestCoupon(
        owner.toBase58(),
        tickers,
        signMessage,
        controller.signal,
        () => setStage("checking"),
      );
      if (!controller.signal.aborted) setResult(issued);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error ? e.message : "No se pudo emitir el cupón.",
        );
    } finally {
      requestRef.current = null;
      if (!controller.signal.aborted) setStage("idle");
    }
  }
  if (result)
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-5 py-8">
        <Link href="/" className="text-sm text-brand-300 underline">
          ← Volver a la cartera
        </Link>
        <h1 className="text-2xl font-bold">Posición acreditada</h1>
        <p className="text-sm leading-relaxed text-zinc-300">
          El servidor ha verificado tu firma, saldo y cotización. Estos son los
          beneficios de ejemplo que te corresponden ahora.
        </p>
        <div className="rounded-xl border border-ink-line bg-ink-soft p-4">
          <p className="text-sm text-zinc-300">
            Total ilustrativo con beneficio verificado
          </p>
          <p className="mt-1 text-2xl font-bold text-ember-400">{usd(total)}</p>
          <p className="mt-2 text-xs text-zinc-400">
            No se ha cobrado ningún importe. La cotización al emitir puede
            cambiar el beneficio estimado.
          </p>
        </div>
        <Coupon
          verifyUrl={window.location.origin + "/verify?c=" + result.token}
          lines={result.lines}
        />
        <p className="break-all text-xs text-zinc-400">
          Wallet acreditada: {result.wallet}
        </p>
        <button
          onClick={() => {
            setResult(null);
            setCart({});
          }}
          className="rounded-xl border border-brand-300 px-4 py-3 text-sm text-brand-300"
        >
          Volver a explorar
        </button>
      </main>
    );
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-7 px-5 pb-28 pt-8">
      <Link href="/" className="text-sm text-brand-300 underline">
        ← Volver a la cartera
      </Link>
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-300">
          Marketplace · Demostración
        </p>
        <h1 className="text-3xl font-bold">Una cartera con ventajas.</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Explora campañas de ejemplo para cada activo. Los productos son
          genéricos: no son ofertas oficiales ni acuerdos con estas empresas.
        </p>
      </header>
      {!ownWallet && (
        <p
          role="status"
          className="rounded-xl border border-ink-line bg-ink-soft p-4 text-sm text-zinc-300"
        >
          {peeked
            ? "Estás consultando una dirección pública. Vuelve a tu wallet conectada para acreditar una posición propia."
            : "Conecta tu wallet desde la cartera para solicitar un cupón de demostración."}
        </p>
      )}
      {ownWallet && !signMessage && (
        <p role="alert" className="text-sm text-red-300">
          Tu wallet no permite firmar mensajes. Utiliza una wallet compatible,
          como Phantom.
        </p>
      )}
      {owner && (holdingsStatus === "error" || priceStatus === "error") && (
        <p role="alert" className="text-sm text-red-300">
          No se pudieron verificar los datos. La emisión está desactivada;
          volveremos a comprobarlos automáticamente.
        </p>
      )}
      {SUPPORTED_ASSETS.map((asset) => {
        const position = positions.find((p) => p.asset.ticker === asset.ticker);
        const pct = position?.tierResult?.tier?.discountPct ?? 0;
        return (
          <section
            key={asset.ticker}
            aria-label={"Campaña para " + asset.ticker}
            className="border-t border-ink-line pt-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <TokenIcon
                logoUrl={asset.logoUrl}
                ticker={asset.ticker}
                size={40}
              />
              <div className="flex-1">
                <h2 className="font-semibold">
                  {asset.company}{" "}
                  <span className="text-xs font-normal text-zinc-400">
                    · {asset.ticker}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Campaña de ejemplo para titulares
                </p>
              </div>
              <span className="text-sm font-semibold text-teal-300">
                {position?.usdValue == null ? "—" : pct + "% demo"}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {PRODUCTS.filter((p) => p.ticker === asset.ticker).map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-ink-soft p-4"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium">{product.name}</h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        {product.blurb}
                      </p>
                      <p className="mt-2 text-sm text-zinc-200">
                        {usd(product.priceUsd)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        disabled={stage !== "idle" || !cart[product.id]}
                        aria-label={"Quitar " + product.name}
                        onClick={() => change(product.id, -1)}
                        className="h-11 w-9 rounded-lg border border-ink-line"
                      >
                        −
                      </button>
                      <span
                        aria-label={"Cantidad de " + product.name}
                        className="w-5 text-center text-sm"
                      >
                        {cart[product.id] ?? 0}
                      </span>
                      <button
                        disabled={stage !== "idle" || cart[product.id] >= 99}
                        aria-label={"Añadir " + product.name}
                        onClick={() => change(product.id, 1)}
                        className="h-11 w-9 rounded-lg border border-brand-300 text-brand-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        );
      })}
      {items.length > 0 && (
        <section
          id="demo-summary"
          aria-label="Resumen de demostración"
          className="rounded-xl border border-brand-600 bg-ink-soft p-5"
        >
          <h2 className="mb-4 font-semibold">Tu ejemplo de compra</h2>
          <div className="flex justify-between text-sm text-zinc-300">
            <span>Subtotal</span>
            <span>{usd(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-teal-300">
            <span>Beneficio estimado</span>
            <span>
              {ready ? "−" + usd(subtotal - total) : "Pendiente de verificar"}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-ink-line pt-3 font-semibold">
            <span>Total ilustrativo</span>
            <span>{ready ? usd(total) : "—"}</span>
          </div>
          <button
            onClick={confirm}
            disabled={!canIssue}
            className="mt-5 w-full rounded-xl bg-brand-600 px-3 py-3.5 text-sm font-semibold text-white hover:bg-brand-500"
          >
            {stage === "signing"
              ? "Confirma el mensaje en tu wallet…"
              : stage === "checking"
                ? "Verificando saldo y cotización…"
                : "Firmar mensaje y generar cupón demo"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-zinc-300">
            No es una transacción. No se moverán fondos. El descuento definitivo
            se calcula al emitir.
          </p>
          {ownWallet && !ready && stage === "idle" && (
            <p role="status" className="mt-3 text-xs text-zinc-300">
              Esperando saldos y precios recientes de los activos seleccionados.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>
      )}
      <Link href="/example" className="text-sm text-brand-300 underline">
        Ver ejemplo ilustrativo sin firmar
      </Link>
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-lg border-t border-ink-line bg-ink p-4">
          <a
            href="#demo-summary"
            className="block rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold"
          >
            Ver resumen · {items.reduce((sum, item) => sum + item.qty, 0)}{" "}
            productos
          </a>
        </div>
      )}
    </main>
  );
}
