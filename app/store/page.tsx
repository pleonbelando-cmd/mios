"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { useAaplxPosition } from "@/hooks/useAaplxPosition";
import { Coupon } from "@/components/Coupon";

function usd(value: number) {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function StorePage() {
  const { owner, tierResult } = useAaplxPosition();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [purchased, setPurchased] = useState(false);
  const [couponToken, setCouponToken] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "error">("idle");

  const discountPct = tierResult?.tier?.discountPct ?? 0;

  const items = useMemo(
    () =>
      PRODUCTS.map((product) => ({
        product,
        qty: cart[product.id] ?? 0,
      })).filter((item) => item.qty > 0),
    [cart]
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.priceUsd * item.qty,
    0
  );
  const discount = (subtotal * discountPct) / 100;
  const total = subtotal - discount;

  function addToCart(productId: string) {
    setPurchased(false);
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[productId] ?? 0) - 1;
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }

  async function handleConfirm() {
    setPurchased(true);

    if (!owner || !tierResult?.tier) {
      setCouponToken(null);
      return;
    }

    setCouponStatus("loading");
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: owner.toBase58(),
          tierId: tierResult.tier.id,
        }),
      });
      if (!res.ok) throw new Error("no ok");
      const data = (await res.json()) as { token: string };
      setCouponToken(data.token);
      setCouponStatus("idle");
    } catch {
      setCouponStatus("error");
    }
  }

  if (purchased) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
        <Link href="/" className="text-xs text-zinc-500 underline">
          ← Volver al dashboard
        </Link>
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-5 text-center">
          <p className="text-lg font-semibold text-emerald-300">
            Compra confirmada (demo)
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {discountPct}% de descuento aplicado por tu tier. Total cobrado:{" "}
            <span className="font-medium text-zinc-100">{usd(total)}</span>
          </p>
        </div>

        {couponStatus === "loading" && (
          <p className="text-center text-xs text-zinc-500">
            Firmando cupón…
          </p>
        )}

        {couponStatus === "error" && (
          <p className="text-center text-xs text-red-400">
            No se pudo generar el cupón verificable.
          </p>
        )}

        {couponToken && tierResult?.tier && (
          <Coupon
            verifyUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?c=${couponToken}`}
            discountPct={tierResult.tier.discountPct}
            tierLabel={tierResult.tier.label}
          />
        )}

        <button
          onClick={() => {
            setCart({});
            setPurchased(false);
            setCouponToken(null);
          }}
          className="self-center text-xs text-zinc-500 underline hover:text-zinc-300"
        >
          Hacer otra compra
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs text-zinc-500 underline">
          ← Dashboard
        </Link>
        <span className="text-lg font-semibold tracking-tight text-zinc-50">
          Orchard Store
        </span>
      </div>

      {owner ? (
        <p className="text-xs text-zinc-500">
          Tu descuento por tier:{" "}
          <span className="font-medium text-violet-300">{discountPct}%</span>
        </p>
      ) : (
        <p className="text-xs text-amber-400">
          Conecta una wallet en el dashboard para desbloquear tu descuento.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div>
              <p className="text-sm font-medium text-zinc-100">
                {product.name}
              </p>
              <p className="text-xs text-zinc-500">{product.blurb}</p>
              <p className="mt-1 text-sm text-zinc-300">
                {usd(product.priceUsd)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(cart[product.id] ?? 0) > 0 && (
                <>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="h-7 w-7 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm">
                    {cart[product.id]}
                  </span>
                </>
              )}
              <button
                onClick={() => addToCart(product.id)}
                className="h-7 w-7 rounded-full border border-violet-600 text-violet-300 hover:bg-violet-600/10"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span>{usd(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-400">
            <span>Descuento ({discountPct}%)</span>
            <span>−{usd(discount)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold text-zinc-50">
            <span>Total</span>
            <span>{usd(total)}</span>
          </div>
          <button
            onClick={handleConfirm}
            className="mt-4 w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Confirmar compra (demo)
          </button>
        </div>
      )}
    </div>
  );
}
