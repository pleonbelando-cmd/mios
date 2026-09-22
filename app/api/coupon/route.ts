import { NextResponse } from "next/server";
import { createCouponToken } from "@/lib/coupon";
import { TIERS } from "@/lib/tiers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { wallet?: unknown; tierId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { wallet, tierId } = body;
  if (typeof wallet !== "string" || !wallet) {
    return NextResponse.json({ error: "Falta wallet" }, { status: 400 });
  }

  const tier = TIERS.find((t) => t.id === tierId);
  if (!tier) {
    return NextResponse.json({ error: "Tier inválido" }, { status: 400 });
  }

  try {
    const token = createCouponToken({
      wallet,
      tierId: tier.id,
      tierLabel: tier.label,
      discountPct: tier.discountPct,
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
