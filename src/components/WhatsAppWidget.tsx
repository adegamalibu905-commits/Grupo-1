"use client";
import { useEffect, useState } from "react";
import "./whatsapp.css";

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21l1.65-4.86A8.5 8.5 0 1 1 8 19.4L3 21z" />
      <path d="M9 8.6c.2 2.9 2.9 5.9 5.9 6.4l1.2-1.1c.2-.2.2-.5 0-.7l-1.6-1c-.2-.1-.4-.1-.6.1l-.5.6c-1.1-.4-2-1.3-2.4-2.4l.6-.5c.2-.2.2-.4.1-.6l-1-1.6c-.2-.2-.5-.2-.7 0L9 8.6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function WhatsAppWidget({ phone, text, label, title, body, cta }: { phone: string; text: string; label: string; title: string; body: string; cta: string }) {
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 2500); return () => clearTimeout(t); }, []);
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  return (
    <div className="wa">
      {!closed && (
        <a className={`wa-card ${on ? "on" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
          <button className="wa-x" aria-label="Fechar" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setClosed(true); }}>×</button>
          <small>{label}</small>
          <b>{title}</b>
          <span className="wa-body">{body}</span>
          <i>{cta}</i>
        </a>
      )}
      <a className="wa-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WaIcon /></a>
    </div>
  );
}