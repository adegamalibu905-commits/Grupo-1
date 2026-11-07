const BASE = process.env.GLADEPAY_BASE_URL || "https://app.gladepay.com.br/v1";

export type GladeStatus = "CREATED" | "SETTLED" | "FAILED" | "REJECTED" | string;

export interface GladeDeposit {
  ok: boolean;
  txId: string;
  publicId: string;
  amountCents: number;
  expiresAt: string;
  status: GladeStatus;
  qrCodeText: string;
  qrCodeBase64: string | null;
  qrCodeUrl: string | null;
  checkoutUrl: string;
}

export interface CreateDepositInput {
  amountCents: number;
  reference: string;
  callbackUrl: string;
  redirectUrl?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  expiresInSeconds?: number;
}

class GladeError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function glade<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.GLADEPAY_API_KEY;
  if (!key) throw new GladeError("GLADEPAY_API_KEY não configurada na Vercel", 500);
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${key.trim()}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new GladeError((data as { error?: string }).error || `GladePay HTTP ${res.status}`, res.status);
  return data as T;
}

type Flat = { key: string; value: unknown; depth: number };
const nk = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

function flatten(o: unknown, depth = 0, out: Flat[] = []): Flat[] {
  if (!o || typeof o !== "object" || depth > 5) return out;
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    out.push({ key: nk(k), value: v, depth });
    flatten(v, depth + 1, out);
  }
  return out;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);
const isHttp = (v: string) => /^https?:\/\//i.test(v);

function byKey(flat: Flat[], names: string[], test: (v: string) => boolean = () => true): string | null {
  for (const n of names) {
    const hit = flat.filter((f) => f.key === n).sort((a, b) => a.depth - b.depth).map((f) => str(f.value)).find((v) => v && test(v));
    if (hit) return hit;
  }
  return null;
}

// A API pode devolver os campos no topo ou aninhados (data, deposit...), com nomes variados.
// Por isso procuramos pelo conteúdo: o código Pix sempre começa com 000201 e contém br.gov.bcb.pix.
function parseDeposit(raw: unknown, fallbackExpiresSec: number): GladeDeposit | null {
  const flat = flatten(raw);
  const strings = flat.map((f) => ({ ...f, s: typeof f.value === "string" ? f.value.trim() : "" })).filter((f) => f.s);

  const qrCodeText: string =
    strings.find((f) => /^000201/.test(f.s) && f.s.length > 50)?.s ??
    strings.find((f) => /br\.gov\.bcb\.pix/i.test(f.s) && !isHttp(f.s) && f.s.length > 50)?.s ??
    "";

  const qrCodeBase64 =
    strings.find((f) => f.s.startsWith("data:image"))?.s ??
    strings.find((f) => f.key.includes("base64") && f.s.length > 100)?.s ??
    strings.find((f) => f.key.includes("qr") && /^iVBOR/.test(f.s))?.s ??
    null;
  const qrCodeUrl =
    strings.find((f) => f.key.includes("qr") && isHttp(f.s))?.s ?? null;
  const checkoutUrl =
    byKey(flat, ["checkouturl", "paymenturl", "paymentlink", "hostedurl", "checkoutlink", "url", "link"], (v) => isHttp(v) && v !== qrCodeUrl) ?? "";

  if (!qrCodeText && !checkoutUrl) return null;

  const txId = byKey(flat, ["txid", "transactionid", "id"]) ?? "";
  const publicId = byKey(flat, ["publicid", "id", "transactionid", "txid", "depositid"]) ?? txId;

  let expiresAt = "";
  for (const f of flat.filter((x) => x.key.includes("expir")).sort((a, b) => a.depth - b.depth)) {
    if (typeof f.value === "string" && !Number.isNaN(Date.parse(f.value))) { expiresAt = new Date(f.value).toISOString(); break; }
    if (typeof f.value === "number" && f.value > 0) {
      expiresAt = f.value > 1e12 ? new Date(f.value).toISOString() : f.value > 1e9 ? new Date(f.value * 1000).toISOString() : new Date(Date.now() + f.value * 1000).toISOString();
      break;
    }
  }
  if (!expiresAt) expiresAt = new Date(Date.now() + fallbackExpiresSec * 1000).toISOString();

  const status = byKey(flat, ["status"]) ?? "CREATED";
  const amountRaw = flat.find((f) => f.key === "amountcents" && typeof f.value === "number")?.value as number | undefined;
  return { ok: true, txId, publicId, amountCents: amountRaw ?? 0, expiresAt, status, qrCodeText, qrCodeBase64, qrCodeUrl, checkoutUrl };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Às vezes a GladePay cria a cobrança mas ainda não devolve o código Pix. Consultamos de novo algumas vezes.
async function waitForQr(dep: GladeDeposit, ttl: number): Promise<GladeDeposit> {
  const id = dep.publicId || dep.txId;
  for (let i = 0; i < 3 && !dep.qrCodeText && id; i++) {
    await sleep(1500);
    try {
      const raw = await glade<unknown>(`/transacoes/${encodeURIComponent(id)}`);
      console.log("gladepay consulta", JSON.stringify(raw).slice(0, 1000));
      if (raw && typeof raw === "object" && (raw as Record<string, unknown>).failureReason) break; // a GladePay já informou falha: não adianta esperar
      const d = parseDeposit(raw, ttl);
      if (d?.qrCodeText) return { ...dep, ...d, publicId: dep.publicId || d.publicId, checkoutUrl: d.checkoutUrl || dep.checkoutUrl };
    } catch { /* tenta de novo */ }
  }
  return dep;
}

async function postDeposit(body: unknown, fallbackExpiresSec: number): Promise<GladeDeposit> {
  const raw = await glade<unknown>("/deposito", { method: "POST", body: JSON.stringify(body) });
  console.log("gladepay resposta", JSON.stringify(raw).slice(0, 2000));
  const dep = parseDeposit(raw, fallbackExpiresSec);
  if (dep) {
    const full = await waitForQr(dep, fallbackExpiresSec);
    // Sem código Pix não há o que mostrar na tela: nunca mandamos o cliente para a página da GladePay.
    if (!full.qrCodeText) throw new GladeError("o provedor de pagamento não confirmou o Pix", 502);
    return full;
  }
  const apiMsg = raw && typeof raw === "object" ? str((raw as Record<string, unknown>).error) ?? str((raw as Record<string, unknown>).message) : null;
  if (apiMsg) throw new GladeError(apiMsg, 502);
  const keys = raw && typeof raw === "object" ? Object.keys(raw as object).join(", ") : typeof raw;
  throw new GladeError(`resposta sem código Pix; campos recebidos: ${keys || "nenhum"}`, 502);
}

// Pix: POST /v1/deposito. Começa só com os campos documentados (amountCents, reference, callbackUrl, customerEmail);
// se falhar (exceto chave inválida), tenta o corpo completo. Sem código Pix, devolvemos o link do checkout da GladePay.
export async function createDeposit(input: CreateDepositInput): Promise<GladeDeposit> {
  const ttl = input.expiresInSeconds ?? 1800;
  const minimal = {
    amountCents: input.amountCents,
    reference: input.reference,
    callbackUrl: input.callbackUrl,
    ...(input.customerEmail ? { customerEmail: input.customerEmail } : {}),
  };
  try {
    return await postDeposit(minimal, ttl);
  } catch (e) {
    if (e instanceof GladeError && (e.status === 401 || e.status === 403)) throw e;
    console.error("gladepay corpo mínimo falhou, tentando o completo:", e instanceof Error ? e.message : e);
    return postDeposit(input, ttl);
  }
}

// Consulta documentada: GET /v1/transacoes/{id} (aceita publicId ou txId).
export async function getDepositStatus(id: string): Promise<{ status: GladeStatus }> {
  const pick = (d: any): string | undefined =>
    d?.status ?? d?.transaction?.status ?? d?.row?.status ?? d?.rows?.[0]?.status;
  const q = encodeURIComponent(id);
  try {
    const d = await glade<any>(`/transacoes/${q}`);
    const s = pick(d);
    if (s) return { status: s };
  } catch (e) {
    if (e instanceof GladeError && (e.status === 401 || e.status === 403)) throw e;
  }
  const d2 = await glade<any>(`/deposito/status?txId=${q}`);
  return { status: pick(d2) || "CREATED" };
}