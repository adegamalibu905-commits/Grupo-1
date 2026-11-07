import { NextResponse } from "next/server";
import { getDepositStatus } from "@/lib/gladepay";
import { updateByPublicId } from "@/lib/db";

export const runtime = "nodejs";

// Não confiamos no corpo recebido: o status real é sempre reconfirmado na API da GladePay.
export async function POST(req: Request) {
  let p: { id?: string; publicId?: string } = {};
  try { p = await req.json(); } catch { /* corpo vazio */ }
  const id = p.id || p.publicId;
  if (!id || typeof id !== "string" || id.length > 64) return NextResponse.json({ ok: true });
  try {
    const { status } = await getDepositStatus(id);
    await updateByPublicId(id, status === "SETTLED" ? { status, paid_at: new Date().toISOString() } : { status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}