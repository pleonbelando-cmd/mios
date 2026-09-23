import { NextResponse } from "next/server";
import { createCouponToken, type CouponLine } from "@/lib/coupon";
import { TIERS } from "@/lib/tiers";
import { findAssetByTicker } from "@/lib/assets";

export const runtime = "nodejs";

type RequestLine = { ticker?: unknown; tierId?: unknown };

export async function POST(request: Request) {
  let body: { wallet?: unknown; lines?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { wallet, lines } = body;
  if (typeof wallet !== "string" || !wallet) {
    return NextResponse.json({ error: "Falta wallet" }, { status: 400 });
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Falta el detalle de la compra" }, { status: 400 });
  }

  const couponLines: CouponLine[] = [];
  for (const raw of lines as RequestLine[]) {
    const ticker = typeof raw.ticker === "string" ? raw.ticker : null;
    const asset = ticker ? findAssetByTicker(ticker) : undefined;
    if (!asset) {
      return NextResponse.json({ error: `Activo desconocido: ${ticker}` }, { status: 400 });
    }
    // El tier se re-valida server-side contra lib/tiers.ts — nunca se
    // confía en el % de descuento que mande el cliente.
    const tier = TIERS.find((t) => t.id === raw.tierId);
    couponLines.push({
      ticker: asset.ticker,
      company: asset.company,
      tierLabel: tier?.label ?? null,
      discountPct: tier?.discountPct ?? 0,
    });
  }

  try {
    const token = createCouponToken({
      wallet,
      lines: couponLines,
      timestamp: Math.floor(Date.now() / 1000),
    });
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error firmando el cupón" },
      { status: 500 }
    );
  }
}
