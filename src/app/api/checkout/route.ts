import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PLANS, TRACKS, SITE, siteUrl } from "@/config/site";
import { createDeposit } from "@/lib/gladepay";
import { insertOrder, updateByReference } from "@/lib/db";
import { isCpf, isEmail, isName, isPhone, onlyDigits } from "@/lib/validate";

export const runtime = "nodejs";
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let b: Record<string, string>;
  try { b = await req.json(); } catch { return bad("Requisição inválida"); }

  const plan = PLANS.find((p) => p.id === b.plan);
  const track = TRACKS.find((t) => t.id === b.track);
  if (!plan || !track) return bad("Plano inválido");
  if (!isName(b.name || "")) return bad("Nome é obrigatório");
  if (!isEmail(b.email || "")) return bad("Email inválido");
  if (!isCpf(b.cpf || "")) return bad("CPF inválido");
  if (!isPhone(b.phone || "")) return bad("Telefone inválido");

  const reference = `ped-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`;
  const name = b.name.trim();
  const email = b.email.trim().toLowerCase();

  await insertOrder({
    reference, track: track.id, plan_id: plan.id, amount_cents: plan.priceCents, status: "CREATED",
    customer_name: name, customer_email: email, customer_cpf: onlyDigits(b.cpf), customer_phone: onlyDigits(b.phone),
  });

  try {
    const dep = await createDeposit({
      amountCents: plan.priceCents,
      reference,
      callbackUrl: `${siteUrl()}/api/webhooks/gladepay`,
      redirectUrl: `${siteUrl()}/obrigado`,
      description: `${SITE.brand} - ${track.label} - ${plan.name}`,
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
    return bad("Não foi possível gerar o Pix agora. Tente novamente.", 502);
  }
}