"use client";
import { useState } from "react";
import { PLANS, TRACKS, brl } from "@/config/site";
import CheckoutModal, { type Selection } from "./CheckoutModal";

export default function Plans() {
  const [track, setTrack] = useState<string>(TRACKS[0].id);
  const [sel, setSel] = useState<Selection | null>(null);
  const trackLabel = TRACKS.find((t) => t.id === track)!.label;

  return (
    <>
      <div className="tabs" role="tablist">
        {TRACKS.map((t) => (
          <button key={t.id} role="tab" aria-selected={track === t.id} className="tab" onClick={() => setTrack(t.id)}>
            {t.label}<small>{t.sub}</small>
          </button>
        ))}
      </div>
      {PLANS.map((p) => (
        <div key={p.id} className={`plan ${p.featured ? "feat" : ""}`}>
          {p.featured && <span className="ribbon">★ MAIS ESCOLHIDO</span>}
          <h3>{p.name}</h3>
          <div className="price">{brl(p.priceCents)} <small>à vista no Pix</small></div>
          <ul className="checks">{p.features.map((x) => <li key={x}>{x}</li>)}</ul>
          <button className="btn btn-gold" onClick={() => setSel({ track, plan: p.id, title: `${trackLabel} — ${p.name}`, priceCents: p.priceCents })}>
            Garantir minha vaga →
          </button>
        </div>
      ))}
      {sel && <CheckoutModal selection={sel} onClose={() => setSel(null)} />}
    </>
  );
}