import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { activeCoupons, autoPricing, computePrice, findCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let b: Record<string, string>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Requisição inválida" }, { status: 400 }); }

  const c = await getContent();
  const coupon = findCoupon(b.code, activeCoupons(c.coupons));
  if (!coupon) return NextResponse.json({ error: "Cupom inválido ou expirado" }, { status: 404 });

  const track = c.plans.tracks.find((t) => t.id === b.track);
  const plan = track?.plans.find((p) => p.id === b.plan);
  if (!plan) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const originalCents = Math.round(plan.price * 100);
  const { totalCents, percent } = computePrice(originalCents, coupon, autoPricing(c.coupons));
  return NextResponse.json({
    code: coupon.code,
    percent,
    originalCents,
    discountCents: originalCents - totalCents,
    totalCents,
  });
}