import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { siteUrl } from "@/config/site";
import { getContent } from "@/lib/content";
import { createDeposit } from "@/lib/gladepay";
import { insertOrder, updateByReference } from "@/lib/db";
import { isCpf, isEmail, isName, isPhone, onlyDigits } from "@/lib/validate";
import { applyDiscount, findCoupon } from "@/lib/coupons";

export const runtime = "nodejs";
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let b: Record<string, string>;
  try { b = await req.json(); } catch { return bad("Requisição inválida"); }

  const c = await getContent();
  const track = c.plans.tracks.find((t) => t.id === b.track);
  const plan = track?.plans.find((p) => p.id === b.plan);
  if (!plan || !track) return bad("Plano inválido");
  const coupon = b.coupon ? findCoupon(b.coupon) : null;
  if (b.coupon && !coupon) return bad("Cupom inválido ou expirado");
  const baseCents = Math.round(plan.price * 100);
  const cents = coupon ? applyDiscount(baseCents, coupon.percent) : baseCents;
  if (!isName(b.name || "")) return bad("Nome é obrigatório");
  if (!isEmail(b.email || "")) return bad("Email inválido");
  if (!isCpf(b.cpf || "")) return bad("CPF inválido");
  if (!isPhone(b.phone || "")) return bad("Telefone inválido");

  const reference = `ped-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`;
  const name = b.name.trim();
  const email = b.email.trim().toLowerCase();

  await insertOrder({
    reference, track: track.id, plan_id: plan.id, amount_cents: cents, status: "CREATED",
    customer_name: name, customer_email: email, customer_cpf: onlyDigits(b.cpf), customer_phone: onlyDigits(b.phone),
  });

  try {
    const dep = await createDeposit({
      amountCents: cents,
      reference,
      callbackUrl: `${siteUrl()}/api/webhooks/gladepay`,
      redirectUrl: `${siteUrl()}/obrigado`,
      description: `${c.settings.brand} - ${track.label} - ${plan.name}${coupon ? ` (cupom ${coupon.code})` : ""}`,
      customerName: name,
      customerEmail: email,
      expiresInSeconds: 1800,
    });
    await updateByReference(reference, { public_id: dep.publicId });
    return NextResponse.json({
      publicId: dep.publicId,
      expiresAt: dep.expiresAt,
      qrCodeText: dep.qrCodeText,
      qrCodeBase64: dep.qrCodeBase64,
      qrCodeUrl: dep.qrCodeUrl,
      checkoutUrl: dep.checkoutUrl,
    });
   } catch (e) {
    await updateByReference(reference, { status: "FAILED" });
    console.error("gladepay", e);
    const detail = e instanceof Error ? e.message : "";
    return bad(`Não foi possível gerar o Pix agora${detail ? ` (${detail})` : ""}. Tente novamente.`, 502);
  }