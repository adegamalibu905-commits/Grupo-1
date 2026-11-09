"use client";
import { useRef, useState } from "react";
import Rich from "@/components/Rich";
import VideoBox from "@/components/VideoBox";
import "./carousel.css";

type Item = { image: string; video?: string; poster?: string; text: string; name: string; role: string };

export default function Carousel({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  const x0 = useRef<number | null>(null);
  const n = items.length;
  if (!n) return null;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const it = items[Math.min(i, n - 1)];
  const video = (it.video || "").trim();
  const cover = it.poster || it.image || "";
  return (
    <div
      className="ns-car"
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (x0.current === null) return;
        const dx = e.changedTouches[0].clientX - x0.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        x0.current = null;
      }}
    >
      <button type="button" className="ns-arrow l" aria-label="Anterior" onClick={() => go(-1)}>‹</button>
      <div className="ns-slide" key={i}>
        {video ? (
          <div className="ns-cvid"><VideoBox url={video} poster={cover} /></div>
        ) : it.image ? (
          <img className="ns-cav" src={it.image} alt={it.name} />
        ) : (
          <div className="ns-cav ns-cav-empty" aria-hidden>👤</div>
        )}
        <p className="ns-ctext"><Rich text={it.text} /></p>
        <p className="ns-cname">{it.name}</p>
        <p className="ns-crole">{it.role}</p>
      </div>
      <button type="button" className="ns-arrow r" aria-label="Próximo" onClick={() => go(1)}>›</button>
      {n > 1 && (
        <div className="ns-dots">
          {items.map((_, k) => <button type="button" key={k} aria-label={`Depoimento ${k + 1}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />)}
        </div>
      )}
    </div>
  );
}