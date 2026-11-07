const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function rest(path: string, init: RequestInit) {
  if (!url || !key) return null;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
  });
  if (!res.ok) console.error("supabase", res.status, await res.text());
  return res;
}

export const insertOrder = (o: Record<string, unknown>) => rest("orders", { method: "POST", body: JSON.stringify(o) });

export const updateByReference = (ref: string, p: Record<string, unknown>) =>
  rest(`orders?reference=eq.${encodeURIComponent(ref)}`, { method: "PATCH", body: JSON.stringify({ ...p, updated_at: new Date().toISOString() }) });

export const updateByPublicId = (id: string, p: Record<string, unknown>) =>
  rest(`orders?public_id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...p, updated_at: new Date().toISOString() }) });