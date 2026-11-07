const BASE = "https://app.gladepay.com.br/v1";

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

async function glade<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.GLADEPAY_API_KEY;
  if (!key) throw new Error("GLADEPAY_API_KEY não configurada");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `GladePay HTTP ${res.status}`);
  return data as T;
}

export const createDeposit = (input: CreateDepositInput) =>
  glade<GladeDeposit>("/deposito", { method: "POST", body: JSON.stringify(input) });

export const getDepositStatus = (id: string) =>
  glade<{ status: GladeStatus }>(`/deposito/status?txId=${encodeURIComponent(id)}`);