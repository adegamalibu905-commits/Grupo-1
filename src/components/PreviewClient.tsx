"use client";
import { useEffect, useMemo, useState } from "react";
import type { Content } from "@/config/site";
import SiteView from "./SiteView";
import ThanksView from "./ThanksView";
import CheckoutModal from "./CheckoutModal";
import { autoPricing, computePrice } from "@/lib/coupons";

const CSS = `
html.is-preview .reveal,html.is-preview .st{opacity:1!important;transform:none!important}
html.is-preview [data-sec]{position:relative;cursor:pointer}
html.is-preview [data-sec]:hover::after{content:"✎ Clique para editar: " attr(data-label);position:absolute;top:6px;left:6px;z-index:60;background:rgba(6,182,212,.95);color:#00212a;font:700 12px/1 system-ui,sans-serif;padding:6px 10px;border-radius:6px;pointer-events:none}
html.is-preview [data-sec]:hover{outline:2px dashed rgba(6,182,212,.7);outline-offset:-2px}
html.is-preview [data-sec].edit-focus{outline:4px solid #06b6d4;outline-offset:-4px}
html.is-preview [data-sec].edit-focus::after{content:"✎ Você está editando: " attr(data-label);position:absolute;top:6px;left:6px;z-index:60;background:#06b6d4;color:#00212a;font:700 12px/1 system-ui,sans-serif;padding:6px 10px;border-radius:6px;pointer-events:none}
html.is-preview #sec-wa.edit-focus .wa-btn{outline:4px solid #06b6d4;border-radius:50%}
`;

const THEME: Record<string, string> = {
  bg: "--bg", card: "--card", line: "--line", text: "--text", muted: "--muted", gold: "--gold", goldLight: "--gold-l", goldDark: "--gold-d",
  blue: "--blue", blueLight: "--blue-l", blueDark: "--blue-d", band: "--band", accent: "--accent",
};

export default function PreviewClient({ initial }: { initial: Content }) {
  const [c, setC] = useState<Content>(initial);
  const [view, setView] = useState<"site" | "thanks">("site");
  const [ck, setCk] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-preview");
    const focusOn = (id: string, label?: string) => {
      document.querySelectorAll("[data-sec].edit-focus").forEach((e) => e.classList.remove("edit-focus"));
      if (!id) return;
      const el = document.getElementById(`sec-${id}`);
      if (!el) return;
      if (label) el.setAttribute("data-label", label);
      el.classList.add("edit-focus");
      if (id === "wa") return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== window.parent) return;
      const m = e.data;
      if (!m || typeof m !== "object") return;
      if (m.type === "full") setC(m.data);
      else if (m.type === "patch") setC((p) => ({ ...p, [m.key]: m.value }));
      else if (m.type === "view") setView(m.view === "thanks" ? "thanks" : "site");
      else if (m.type === "checkout") setCk(!!m.open);
      else if (m.type === "focus") setTimeout(() => focusOn(m.id, m.label), m.delay ?? 60);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".modal-bg")) return;
      if (t.closest(".tab,.ns-arrow,.ns-dots button,.wa-x")) return;
      e.preventDefault(); e.stopPropagation();
      const s = t.closest("[data-sec]") as HTMLElement | null;
      if (s) parent.postMessage({ type: "select", id: s.dataset.sec }, location.origin);
    };
    addEventListener("message", onMsg);
    document.addEventListener("click", onClick, true);
    parent.postMessage({ type: "ready" }, location.origin);
    return () => { removeEventListener("message", onMsg); document.removeEventListener("click", onClick, true); root.classList.remove("is-preview"); };
  }, []);

  useEffect(() => {
    const s = document.documentElement.style;
    for (const [k, v] of Object.entries(c.theme)) if (THEME[k]) s.setProperty(THEME[k], v as string);
  }, [c.theme]);

  const sample = useMemo(() => {
    const t = c.plans.tracks[0], p = t?.plans[0];
    if (!t || !p) return null;
    const orig = Math.round(p.price * 100);
    const info = computePrice(orig, null, autoPricing(c.coupons));
    return { track: t.id, plan: p.id, title: `${t.label} — ${p.name}`, priceCents: info.totalCents, originalCents: orig };
  }, [c.plans, c.coupons]);

  return (
    <>
      <style>{CSS}</style>
      {view === "thanks" ? <ThanksView c={c} /> : <SiteView c={c} />}
      {ck && sample && <CheckoutModal selection={sample} cfg={c.checkout} preview onClose={() => { setCk(false); parent.postMessage({ type: "checkoutClosed" }, location.origin); }} />}
    </>
  );
}