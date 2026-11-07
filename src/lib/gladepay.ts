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

// Pix: POST /v1/deposito. Tenta o corpo completo; se a API recusar campos extras (4xx),
// repete só com os campos documentados (amountCents, reference, callbackUrl, customerEmail).
export async function createDeposit(input: CreateDepositInput): Promise<GladeDeposit> {
  try {
    return await glade<GladeDeposit>("/deposito", { method: "POST", body: JSON.stringify(input) });
  } catch (e) {
    if (e instanceof GladeError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 403) {
      const minimal = {
        amountCents: input.amountCents,
        reference: input.reference,
        callbackUrl: input.callbackUrl,
        ...(input.customerEmail ? { customerEmail: input.customerEmail } : {}),
      };
      return glade<GladeDeposit>("/deposito", { method: "POST", body: JSON.stringify(minimal) });
    }
    throw e;
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