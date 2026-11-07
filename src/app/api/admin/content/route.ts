import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent, saveContent } from "@/lib/content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const no = () => NextResponse.json({ error: "Não autorizado" }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return no();
  return NextResponse.json(await getContent());
}
export async function PUT(req: Request) {
  if (!isAdmin()) return no();
  const txt = await req.text();
  if (txt.length > 6_000_000) return NextResponse.json({ error: "Conteúdo grande demais (reduza as imagens)" }, { status: 413 });
  let d: { sections?: unknown; hero?: unknown; plans?: unknown };
  try { d = JSON.parse(txt); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!d || !Array.isArray(d.sections) || !d.hero || !d.plans) return NextResponse.json({ error: "Estrutura inválida" }, { status: 400 });
  try { await saveContent(d); return NextResponse.json({ ok: true }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao salvar" }, { status: 500 }); }
}