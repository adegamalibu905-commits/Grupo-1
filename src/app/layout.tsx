import type { Metadata, Viewport } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";

const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const head = Roboto({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-head", display: "swap" });

export const metadata: Metadata = {
  title: "Mentoria PMMG | Soldado e Cadete",
  description: "A mentoria que mais aprova na PMMG. Pagamento por Pix com confirmação automática.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#050505" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${head.variable}`}>
      <body>{children}</body>
    </html>
  );
}