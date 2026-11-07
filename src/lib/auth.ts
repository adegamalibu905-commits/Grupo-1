import { createHmac, createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const USER = (process.env.ADMIN_USER || "leigo").trim().toLowerCase();
const PASS = process.env.ADMIN_PASS || "adega";
const SECRET = process.env.ADMIN_SECRET || `${USER}:${PASS}:painel-v1`;
const sha = (s: string) => createHash("sha256").update(s).digest();
const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");

export function checkLogin(user: unknown, pass: unknown) {
  const u = timingSafeEqual(sha(String(user ?? "").trim().toLowerCase()), sha(USER));
  const p = timingSafeEqual(sha(String(pass ?? "")), sha(PASS));
  return u && p;
}
export function makeToken() { const exp = String(Date.now() + 12 * 3600 * 1000); return `${exp}.${sign(exp)}`; }
export function isAdmin() {
  const t = cookies().get("adm")?.value;
  if (!t) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}