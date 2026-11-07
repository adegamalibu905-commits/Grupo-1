"use client";
import { useEffect, useState } from "react";

export default function WhatsAppWidget({ phone, text, label, title, body, cta }: { phone: string; text: string; label: string; title: string; body: string; cta: string }) {
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 2500); return () => clearTimeout(t); }, []);
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  return (
    <div className="wa">
      {!closed && (
        <a className={`wa-card ${on ? "on" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
          <button className="wa-x" aria-label="Fechar" onClick={(e) => { e.preventDefault(); setClosed(true); }}>×</button>
          <small>{label}</small><b>{title}</b>{body}<br /><i>{cta}</i>
        </a>
      )}
      <a className="wa-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
    </div>
  );
}