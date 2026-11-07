"use client";
import { useState } from "react";
import type { Content } from "@/config/site";
import CheckoutModal, { type Selection } from "./CheckoutModal";
import { useTween } from "./CountUp";

function Price({ v }: { v: number }) {
  const n = useTween(v);
  const [i, d] = n.toFixed(2).split(".");
  return <div className="price"><span>R$</span><b>{Number(i).toLocaleString("pt-BR")}</b><small>,{d}</small></div>;
}

export default function Plans({ data }: { data: Content["plans"] }) {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState<Selection | null>(null);
  const track = data.tracks[ti] ?? data.tracks[0];
  if (!track) return null;
  return (
    <div className={`themed ${track.colorTheme === "blue" ? "blue" : ""}`}>
      <div className="tabs" role="tablist">
        {data.tracks.map((t, i) => (
          <button key={t.id} role="tab" aria-selected={ti === i} className="tab" onClick={() => setTi(i)}>{t.label}<small>{t.sub}</small></button>
        ))}
      </div>
      <div className="plans">
        {track.plans.map((p, i) => (
          <div key={i} className={`plan ${p.featured ? "feat" : ""}`}>
            {p.featured && <span className="ribbon">{data.ribbon}</span>}
            <span className="lbl">{p.label}</span>
            <h3>{p.name}</h3>
            {p.oldPrice > 0 && <div className="old">de R$ {p.oldPrice.toLocaleString("pt-BR")}</div>}
            <Price v={p.price} />
            <div className="pnote">{data.priceNote}</div>
            <ul className="checks">{p.features.map((x, j) => <li key={j}>{x}</li>)}</ul>
            <button className="btn btn-gold" onClick={() => setSel({ track: track.id, plan: p.id, title: `${track.label} — ${p.name}`, priceCents: Math.round(p.price * 100) })}>{data.cta}</button>
          </div>
        ))}
      </div>
      {sel && <CheckoutModal selection={sel} onClose={() => setSel(null)} />}
    </div>
  );
}