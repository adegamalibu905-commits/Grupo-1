import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import PreviewClient from "@/components/PreviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prévia", robots: { index: false, follow: false } };

// Só abre dentro do painel (/admin) e para quem fez login.
export default async function Preview() {
  if (!isAdmin()) return <main style={{ padding: 40, textAlign: "center", fontFamily: "system-ui", color: "#999" }}>Entre no painel /admin para ver a prévia.</main>;
  return <PreviewClient initial={await getContent()} />;
}