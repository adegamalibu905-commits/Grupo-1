import type { Metadata, Viewport } from "next";
import { Poppins, Roboto, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";

const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const red = Red_Hat_Display({ subsets: ["latin"], weight: ["500", "700", "800", "900"], variable: "--font-red", display: "swap" });
const head = Roboto({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-head", display: "swap" });

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();
  return { title: settings.metaTitle, description: settings.metaDescription };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#050505" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = (await getContent()).theme;
  const vars = {
    "--bg": t.bg, "--card": t.card, "--line": t.line, "--text": t.text, "--muted": t.muted,
    "--gold": t.gold, "--gold-l": t.goldLight, "--gold-d": t.goldDark,
    "--blue": t.blue, "--blue-l": t.blueLight, "--blue-d": t.blueDark, "--band": t.band, "--accent": t.accent,
  } as React.CSSProperties;
  return (
    <html lang="pt-BR" className={`${body.variable} ${head.variable} ${red.variable}`} style={vars}>
      <body>{children}</body>
    </html>
  );
}