const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const secret = process.env.MENTORIA_DB_SECRET;

async function rpc(fn: string, args: Record<string, unknown>) {
  if (!url || !anon || !secret) {
    console.error("supabase: variáveis ausentes (SUPABASE_URL, SUPABASE_ANON_KEY, MENTORIA_DB_SECRET)");
    return null;
  }
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    cache: "no-store",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_secret: secret, ...args }),
  });
  if (!res.ok) console.error("supabase rpc", fn, res.status, await res.text());
  return res;
}

type OrderInput = {
  reference: string;
  track: string;
  plan_id: string;
  amount_cents: number;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;
  status?: string;
};
type OrderPatch = { public_id?: string; status?: string; paid_at?: string };

export const insertOrder = (o: OrderInput) =>
  rpc("mentoria_create_order", {
    p_reference: o.reference,
    p_track: o.track,
    p_plan_id: o.plan_id,
    p_amount_cents: o.amount_cents,
    p_customer_name: o.customer_name,
    p_customer_email: o.customer_email,
    p_customer_cpf: o.customer_cpf,
    p_customer_phone: o.customer_phone,
  });

export const updateByReference = (ref: string, p: OrderPatch) =>
  rpc("mentoria_update_order", { p_reference: ref, p_public_id: p.public_id ?? null, p_status: p.status ?? null });

export const updateByPublicId = (id: string, p: OrderPatch) =>
  rpc("mentoria_update_order_public", { p_public_id: id, p_status: p.status ?? null });