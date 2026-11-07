import { NextResponse } from "next/server";
import { checkLogin, makeToken } from "@/lib/auth";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  await new Promise((r) => setTimeout(r, 400));
  if (!checkLogin(b.user, b.pass)) return NextResponse.json({ error: "Nome ou senha incorretos" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("adm", makeToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("adm", "", { path: "/", maxAge: 0 });
  return res;
}