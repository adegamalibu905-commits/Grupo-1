import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Envio de vídeos pelo painel.
  O vídeo NÃO passa por aqui (a Vercel não aceita arquivos grandes). Esta rota só confere se você está
  logado no painel e pede ao Supabase uma "autorização de envio" para o navegador mandar o arquivo direto.
*/
const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;
const BUCKET = "site-media";
const MAX = 50 * 1024 * 1024; // 50 MB (limite do plano gratuito do Supabase)

const H = (): Record<string, string> => ({
  apikey: KEY!, "Content-Type": "application/json",
  ...(KEY!.startsWith("sb_") ? {} : { Authorization: `Bearer ${KEY}` }),
});
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function ensureBucket() {
  const g = await fetch(`${URL_}/storage/v1/bucket/${BUCKET}`, { headers: H(), cache: "no-store" });
  if (g.ok) return;
  const c = await fetch(`${URL_}/storage/v1/bucket`, {
    method: "POST", headers: H(), body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!c.ok) {
    const t = await c.text();
    if (!/exist|duplicate/i.test(t)) throw new Error(`Não consegui criar a pasta de vídeos (${c.status}). ${t.slice(0, 160)}`);
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return fail("Não autorizado", 401);
  if (!URL_ || !KEY) return fail("O envio de vídeo precisa do Supabase configurado na Vercel (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY). Enquanto isso, use um link do YouTube.");

  let b: { name?: string; type?: string; size?: number };
  try { b = await req.json(); } catch { return fail("Pedido inválido"); }
  const type = String(b.type || "");
  const size = Number(b.size || 0);
  if (!type.startsWith("video/")) return fail("Este arquivo não é um vídeo.");
  if (size > MAX) return fail("O vídeo passa de 50 MB. Suba no YouTube (como “não listado”) e cole o link aqui.");

  const fromName = (String(b.name || "").match(/\.([a-z0-9]{2,4})$/i)?.[1] || "").toLowerCase();
  const ext = ["mp4", "webm", "mov", "m4v"].includes(fromName) ? fromName : type.includes("webm") ? "webm" : "mp4";
  const path = `videos/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    await ensureBucket();
    const r = await fetch(`${URL_}/storage/v1/object/upload/sign/${BUCKET}/${path}`, { method: "POST", headers: H(), body: "{}" });
    if (!r.ok) return fail(`O Supabase recusou o envio (${r.status}). ${(await r.text()).slice(0, 160)}`, 502);
    const d = (await r.json()) as { url?: string; token?: string };
    const token = d.token || (d.url ? new URL(d.url, "http://x").searchParams.get("token") : "") || "";
    if (!token) return fail("O Supabase não devolveu a autorização de envio.", 502);
    return NextResponse.json({
      uploadUrl: `${URL_}/storage/v1/object/upload/sign/${BUCKET}/${path}?token=${encodeURIComponent(token)}`,
      publicUrl: `${URL_}/storage/v1/object/public/${BUCKET}/${path}`,
      apikey: ANON || "",
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erro ao preparar o envio", 500);
  }
}