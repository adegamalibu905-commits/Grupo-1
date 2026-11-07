"use client";
import { useEffect, useState } from "react";
import { SITE } from "@/config/site";

export default function WhatsAppWidget() {
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 2500); return () => clearTimeout(t); }, []);
  const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappText)}`;
  return (
    <div className="wa">
      {!closed && (
        <a className={`wa-card ${on ? "on" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
          <button className="wa-x" aria-label="Fechar" onClick={(e) => { e.preventDefault(); setClosed(true); }}>×</button>
          <small>ATENDIMENTO</small>
          <b>Fale com nossa equipe</b>
          Tire suas dúvidas pelo WhatsApp<br /><i>Iniciar conversa →</i>
        </a>
      )}
      <a className="wa-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
    </div>
  );
}