"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import "./whatsapp.css";

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21l1.65-4.86A8.5 8.5 0 1 1 8 19.4L3 21z" />
      <path d="M9 8.6c.2 2.9 2.9 5.9 5.9 6.4l1.2-1.1c.2-.2.2-.5 0-.7l-1.6-1c-.2-.1-.4-.1-.6.1l-.5.6c-1.1-.4-2-1.3-2.4-2.4l.6-.5c.2-.2.2-.4.1-.6l-1-1.6c-.2-.2-.5-.2-.7 0L9 8.6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M13.6 21v-7.8h2.6l.4-3.1h-3V8.2c0-.9.3-1.5 1.5-1.5h1.6V3.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3.1h2.6V21h3.1z" />
    </svg>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TtIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.3 2.4 1.7 3.9 4 4.1v3.1c-1.5 0-2.9-.5-4-1.3v6.3c0 3.2-2.6 5.8-5.8 5.8S5.1 18.4 5.1 15.2s2.6-5.8 5.8-5.8c.3 0 .6 0 .9.1v3.2a2.7 2.7 0 0 0-.9-.2 2.6 2.6 0 1 0 2.7 2.7V3h2.9z" />
    </svg>
  );
}

type Kind = "facebook" | "instagram" | "tiktok";

const BASE: Record<Kind, string> = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/@",
};

// Aceita link completo, "dominio.com/perfil" ou só o @usuario. Bloqueia qualquer esquema que não seja http(s).
function safeUrl(raw: string, kind: Kind): string {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "";
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return `https://${v}`;
  const handle = v.replace(/^@/, "").replace(/\s+/g, "");
  return handle ? `${BASE[kind]}${handle}` : "";
}

type Item = { id: string; name: string; href: string; icon: ReactNode };

export default function WhatsAppWidget({
  phone, text, label, title, body, cta, facebook = "", instagram = "", tiktok = "",
}: {
  phone: string; text: string; label: string; title: string; body: string; cta: string;
  facebook?: string; instagram?: string; tiktok?: string;
}) {
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setOn(true), 2500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const waHref = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  // Ordem da coluna, de cima para baixo: Facebook, Instagram, TikTok e, por último, WhatsApp.
  const items: Item[] = [];
  const fb = safeUrl(facebook, "facebook");
  const ig = safeUrl(instagram, "instagram");
  const tt = safeUrl(tiktok, "tiktok");
  if (fb) items.push({ id: "facebook", name: "Facebook", href: fb, icon: <FbIcon /> });
  if (ig) items.push({ id: "instagram", name: "Instagram", href: ig, icon: <IgIcon /> });
  if (tt) items.push({ id: "tiktok", name: "TikTok", href: tt, icon: <TtIcon /> });
  items.push({ id: "whatsapp", name: "WhatsApp", href: waHref, icon: <WaIcon /> });

  return (
    <div className="wa" ref={box}>
      <div className={`wa-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        {items.map((it, i) => (
          <a
            key={it.id}
            className={`wa-item wa-${it.id}`}
            style={{ transitionDelay: open ? `${i * 55}ms` : "0ms" }}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <span className="wa-ico">{it.icon}</span>
            <span className="wa-name">{it.name}</span>
          </a>
        ))}
      </div>

      {!closed && !open && (
        <div
          className={`wa-card ${on ? "on" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
        >
          <button className="wa-x" aria-label="Fechar" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClosed(true); }}>×</button>
          <small>{label}</small>
          <b>{title}</b>
          <span className="wa-body">{body}</span>
          <i>{cta}</i>
        </div>
      )}

      <button
        type="button"
        className={`wa-btn ${open ? "is-open" : ""}`}
        aria-label={open ? "Fechar menu de contato" : "Abrir menu de contato"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <WaIcon />}
      </button>
    </div>
  );
}
