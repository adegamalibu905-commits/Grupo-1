"use client";
import { useState } from "react";
import type { Content } from "@/config/site";
import CheckoutModal, { type Selection } from "./CheckoutModal";
import Reveal from "./Reveal";
import { useTween } from "./CountUp";
import { computePrice, type AutoPricing } from "@/lib/coupons";

function Price({ v }: { v: number }) {
  const n = useTween(v);
  const [i, d] = n.toFixed(2).split(".");
  return <div className="price"><span>R$</span><b>{Number(i).toLocaleString("pt-BR")}</b><small>,{d}</small></div>;
}

type CareerMap = Record<string, Content["career"]["soldado"]>;

export default function Plans({ data, career, auto, checkout }: { data: Content["plans"]; career: Content["career"]; auto: AutoPricing; checkout: Content["checkout"] }) {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState<Selection | null>(null);
  const track = data.tracks[ti] ?? data.tracks[0];
  if (!track) return null;
  const cr = (career as CareerMap)[track.id];
  const pay = data.payNote.split("•").map((x) => x.trim()).filter(Boolean);
  return (
    <div className={`themed ${track.colorTheme === "blue" ? "blue" : ""}`}>
      <div className="tabs" role="tablist">
        {data.tracks.map((t, i) => (
          <button key={t.id} role="tab" aria-selected={ti === i} className="tab" onClick={() => setTi(i)}>{t.label}<small>{t.sub}</small></button>
        ))}
      </div>
      <div className="plans">
        {track.plans.map((p, i) => {
          const orig = Math.round(p.price * 100);
          const info = computePrice(orig, null, auto);
          const off = info.percent > 0;
          return (
          <div key={i} className={`plan ${p.featured ? "feat" : ""}`}>
            {p.featured && <span className="ribbon">{data.ribbon}</span>}
            <span className="lbl">{p.label}</span>
            <h3>{p.name}</h3>
            {off
              ? <div className="old">de R$ {p.price.toLocaleString("pt-BR")}</div>
              : p.oldPrice > 0 && <div className="old">de R$ {p.oldPrice.toLocaleString("pt-BR")}</div>}
            <Price v={info.totalCents / 100} />
            <div className="pnote">{data.priceNote}{off ? ` • ${info.percent}% OFF` : ""}</div>
            <ul className="checks">{p.features.map((x, j) => <li key={j}>{x}</li>)}</ul>
            <button className="btn btn-gold" onClick={() => setSel({ track: track.id, plan: p.id, title: `${track.label} — ${p.name}`, priceCents: info.totalCents, originalCents: orig })}>{data.cta}</button>
          </div>
          );
        })}
      </div>

      <Reveal>
        <div className="careerbox" key={track.id}>
          {cr && (
            <>
              <p className="cover">{cr.overline}</p>
              <h2 className="ctitle">{cr.titleStart} <span className="accent">{cr.titleAccent}</span> {cr.titleEnd}</h2>
              <p className="csub">{cr.subtitle}</p>
              <div className="clist">
                {cr.items.map((it, i) => (
                  <div className="citem st" style={{ "--i": i } as React.CSSProperties} key={i}>
                    <span className="cok" aria-hidden>✓</span>
                    <div><b>{it.t}</b><p>{it.d}</p></div>
                  </div>
                ))}
              </div>
              <p className="cnote">{cr.note}</p>
            </>
          )}
          <hr className="cline" />
          <p className="rtitle">{data.receivesTitle}</p>
          <div className="rchips">{data.receives.map((r, i) => <span className="rchip st" style={{ "--i": i } as React.CSSProperties} key={i}>{r}</span>)}</div>
          <div className="rpay">{pay.map((x, i) => <span key={i}>{x}</span>)}</div>
          <p className="rfine">{data.finePrint} <a href={data.termsLink || "#"}>{data.termsText}</a>.</p>
        </div>
      </Reveal>
      {sel && <CheckoutModal selection={sel} cfg={checkout} onClose={() => setSel(null)} />}
    </div>
  );
}