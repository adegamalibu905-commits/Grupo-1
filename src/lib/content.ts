import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CONTENT, type Content } from "@/config/site";

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FILE = path.join(process.cwd(), ".data", "content.json");
const TABLE = "mentoria_content";

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
  const def = DEFAULT_CONTENT.sections;
  const ids = new Set(def.map((s) => s.id));
  const savedHasNew = c.sections.some((s) => s.id === "redacao");
  if (!savedHasNew) {
    // Migração única: aplica a nova ordem da página (sem "Como funciona") usando os padrões.
    const keep = new Set(["hero", "video", "plans", "renew", "results", "what", "testimonials"]);
    const was = new Map(c.sections.map((s) => [s.id, s.on]));
    c.sections = def.map((s) => ({ ...s, on: keep.has(s.id) && was.has(s.id) ? (was.get(s.id) as boolean) : s.on }));
  } else {
    const list = c.sections.filter((s) => ids.has(s.id));
    const have = new Set(list.map((s) => s.id));
    def.forEach((s, i) => {
      if (have.has(s.id)) return;
      let at = list.length;
      for (let j = i - 1; j >= 0; j--) {
        const k = list.findIndex((x) => x.id === def[j].id);
        if (k >= 0) { at = k + 1; break; }
      }
      list.splice(at, 0, { ...s });
      have.add(s.id);
    });
    c.sections = list;
  }
  c.what.items = c.what.items.map((i) => ({ ...i, image: i.image || "" }));
  return c;
}

async function readRaw(): Promise<unknown> {
  if (URL_ && KEY) {
    try {
      const r = await fetch(`${URL_}/rest/v1/${TABLE}?id=eq.main&select=data`, { headers: H(), cache: "no-store" });
      if (r.ok) { const rows = await r.json(); if (rows?.[0]?.data) return rows[0].data; }
      else console.error(TABLE, r.status, await r.text());
    } catch (e) { console.error(TABLE, e); }
    return null;
  }
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return null; }
}

export async function getContent(): Promise<Content> { return normalize(await readRaw()); }

export async function saveContent(data: unknown): Promise<void> {
  const c = normalize(data);
  if (URL_ && KEY) {
    const r = await fetch(`${URL_}/rest/v1/${TABLE}?on_conflict=id`, {
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