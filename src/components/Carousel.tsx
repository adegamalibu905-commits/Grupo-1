"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Rich from "@/components/Rich";
import "./carousel.css";

type Item = { image?: string; video?: string; poster?: string; text?: string; name?: string; role?: string };

/* ---------- Ajudantes para entender o link do vídeo ---------- */
function ytId(u: string) {
  const m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return m ? m[1] : "";
}
function vimeoId(u: string) {
  const m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : "";
}
type Player = { kind: "iframe" | "file"; src: string; vertical: boolean };
function playerOf(u: string): Player {
  const y = ytId(u);
  if (y) return { kind: "iframe", src: `https://www.youtube.com/embed/${y}?autoplay=1&rel=0&playsinline=1`, vertical: /youtube\.com\/shorts\//.test(u) };
  const v = vimeoId(u);
  if (v) return { kind: "iframe", src: `https://player.vimeo.com/video/${v}?autoplay=1`, vertical: false };
  return { kind: "file", src: u, vertical: false };
}
const isFile = (u: string) => !ytId(u) && !vimeoId(u);

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path d={dir === "l" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Janela grande com o vídeo (como na foto de referência) ---------- */
function Lightbox({ items, start, onClose }: { items: Item[]; start: number; onClose: () => void }) {
  const [k, setK] = useState(start);
  const n = items.length;
  const go = useCallback((d: number) => setK((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  const it = items[k];
  const p = playerOf((it.video || "").trim());
  return (
    <div className="vc-lb" role="dialog" aria-modal="true" aria-label="Vídeo" onClick={onClose}>
      <div className="vc-lb-top" onClick={(e) => e.stopPropagation()}>
        <span className="vc-lb-count">{k + 1} / {n}</span>
        <button type="button" className="vc-lb-x" aria-label="Fechar" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className={`vc-lb-stage ${p.vertical ? "vert" : ""}`} onClick={(e) => e.stopPropagation()}>
        {p.kind === "iframe"
          ? <iframe key={k} src={p.src} title="Vídeo" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen />
          : <video key={k} src={p.src} controls autoPlay playsInline />}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="vc-lb-arrow l" aria-label="Vídeo anterior" onClick={(e) => { e.stopPropagation(); go(-1); }}><Chevron dir="l" /></button>
          <button type="button" className="vc-lb-arrow r" aria-label="Próximo vídeo" onClick={(e) => { e.stopPropagation(); go(1); }}><Chevron dir="r" /></button>
        </>
      )}
    </div>
  );
}

/* ---------- Carrossel ---------- */
export default function Carousel({ items }: { items: Item[] }) {
  const n = items.length;
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState<number | null>(null); // posição dentro da lista de vídeos
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Só entram na janela de vídeo os itens que têm vídeo
  const withVideo = items.map((it, idx) => ({ it, idx })).filter((x) => (x.it.video || "").trim());
  const videos = withVideo.map((x) => x.it);

  const slideAt = (k: number) => track.current?.children[k] as HTMLElement | undefined;
  const goTo = (k: number) => {
    const t = track.current, el = slideAt(k);
    if (!t || !el) return;
    t.scrollTo({ left: el.offsetLeft - (t.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  };
  const step = (d: number) => goTo((i + d + n) % n);

  // Descobre qual cartão está no centro enquanto o visitante arrasta
  const raf = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const t = track.current;
      if (!t) return;
      const mid = t.scrollLeft + t.clientWidth / 2;
      let best = 0, bd = Infinity;
      for (let k = 0; k < t.children.length; k++) {
        const el = t.children[k] as HTMLElement;
        const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mid);
        if (d < bd) { bd = d; best = k; }
      }
      setI(best);
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  if (!n) return null;

  return (
    <div className="vc">
      <div className="vc-track" ref={track} onScroll={onScroll}>
        {items.map((it, k) => {
          const video = (it.video || "").trim();
          const yt = ytId(video);
          const cover = (it.poster || it.image || "").trim();
          const auto = !cover && yt ? `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg` : "";
          const hasMedia = !!(video || cover);
          const caption = !!(it.text || it.name || it.role);
          const vPos = withVideo.findIndex((x) => x.idx === k);
          return (
            <div className={`vc-slide ${k === i ? "on" : ""}`} key={k}>
              {hasMedia ? (
                <>
                  <div
                    className={`vc-card ${video ? "playable" : ""}`}
                    role={video ? "button" : undefined}
                    tabIndex={video ? 0 : undefined}
                    aria-label={video ? `Assistir vídeo${it.name ? " de " + it.name : ""}` : undefined}
                    onClick={() => { if (video) setOpen(vPos); }}
                    onKeyDown={(e) => { if (video && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(vPos); } }}
                  >
                    {cover ? (
                      <img className="vc-img" src={cover} alt={it.name || ""} draggable={false} />
                    ) : auto ? (
                      <img
                        className="vc-img"
                        src={auto}
                        alt={it.name || ""}
                        draggable={false}
                        onError={(e) => {
                          const t = e.currentTarget;
                          if (!t.dataset.fb) { t.dataset.fb = "1"; t.src = `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`; }
                        }}
                      />
                    ) : video && isFile(video) ? (
                      <video className="vc-img" src={`${video}#t=0.1`} preload="metadata" muted playsInline />
                    ) : null}
                    {video && (
                      <span className="vc-play" aria-hidden>
                        <svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
                      </span>
                    )}
                  </div>
                  {caption && (
                    <div className="vc-after">
                      {it.text ? <p className="vc-text"><Rich text={it.text} /></p> : null}
                      {it.name ? <p className="vc-name">{it.name}</p> : null}
                      {it.role ? <p className="vc-role">{it.role}</p> : null}
                    </div>
                  )}
                </>
              ) : (
                <div className="vc-tcard">
                  {it.text ? <p className="vc-text"><Rich text={it.text} /></p> : null}
                  {it.name ? <p className="vc-name">{it.name}</p> : null}
                  {it.role ? <p className="vc-role">{it.role}</p> : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button type="button" className="vc-arrow l" aria-label="Anterior" onClick={() => step(-1)}><Chevron dir="l" /></button>
          <button type="button" className="vc-arrow r" aria-label="Próximo" onClick={() => step(1)}><Chevron dir="r" /></button>
          <div className="vc-dots">
            {items.map((_, k) => <button type="button" key={k} aria-label={`Depoimento ${k + 1}`} className={k === i ? "on" : ""} onClick={() => goTo(k)} />)}
          </div>
        </>
      )}

      {mounted && open !== null && videos.length > 0 &&
        createPortal(<Lightbox items={videos} start={Math.min(open, videos.length - 1)} onClose={() => setOpen(null)} />, document.body)}
    </div>
  );
}