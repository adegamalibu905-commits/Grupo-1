import { NextResponse } from "next/server";
import { getDepositStatus } from "@/lib/gladepay";
import { updateByPublicId } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || id.length > 64) return NextResponse.json({ error: "id inválido" }, { status: 400 });
  try {
    const { status } = await getDepositStatus(id);
    if (status === "SETTLED") await updateByPublicId(id, { status, paid_at: new Date().toISOString() });
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar" }, { status: 502 });
  }
}