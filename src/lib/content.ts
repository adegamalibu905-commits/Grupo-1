import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CONTENT, type Content } from "@/config/site";

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FILE = path.join(process.cwd(), ".data", "content.json");

// Chaves novas (sb_secret_...) não são JWT: vão só no header apikey. Chaves antigas (JWT) também precisam do Bearer.
const H = (): Record<string, string> => ({
  apikey: KEY!, "Content-Type": "application/json",
  ...(KEY!.startsWith("sb_") ? {} : { Authorization: `Bearer ${KEY}` }),
});

/* eslint-disable @typescript-eslint/no-explicit-any */
function merge(d: any, s: any): any {
  if (Array.isArray(d)) return Array.isArray(s) ? s : d;
  if (d && typeof d === "object") {
    const o: any = {};
    for (const k of Object.keys(d)) o[k] = s && typeof s === "object" && k in s ? merge(d[k], s[k]) : d[k];
    return o;
  }
  return typeof s === typeof d ? s : d;
}

export function normalize(saved: unknown): Content {
  const c = merge(DEFAULT_CONTENT, saved) as Content;
  const have = new Set(c.sections.map((s) => s.id));
  for (const s of DEFAULT_CONTENT.sections) if (!have.has(s.id)) c.sections.push({ ...s });
  return c;
}

async function readRaw(): Promise<unknown> {
  if (URL_ && KEY) {
    try {
      const r = await fetch(`${URL_}/rest/v1/site_content?id=eq.main&select=data`, { headers: H(), cache: "no-store" });
      if (r.ok) { const rows = await r.json(); if (rows?.[0]?.data) return rows[0].data; }
      else console.error("site_content", r.status, await r.text());
    } catch (e) { console.error("site_content", e); }
    return null;
  }
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return null; }
}

export async function getContent(): Promise<Content> { return normalize(await readRaw()); }

export async function saveContent(data: unknown): Promise<void> {
  const c = normalize(data);
  if (URL_ && KEY) {
    const r = await fetch(`${URL_}/rest/v1/site_content?on_conflict=id`, {
      method: "POST", headers: { ...H(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: "main", data: c, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    return;
  }
  if (process.env.VERCEL) throw new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel para salvar.");
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(c, null, 2));
} 