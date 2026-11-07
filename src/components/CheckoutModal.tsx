"use client";
import { useEffect, useMemo, useState } from "react";
import { brl } from "@/config/site";
import { isCpf, isEmail, isName, isPhone, maskCpf, maskPhone } from "@/lib/validate";

export type Selection = { track: string; plan: string; title: string; priceCents: number };
type Pix = { publicId: string; expiresAt: string; qrCodeText: string; qrCodeBase64: string | null; qrCodeUrl: string | null; checkoutUrl: string };
type Step = "form" | "loading" | "pix" | "paid";
type Applied = { code: string; percent: number; originalCents: number; discountCents: number; totalCents: number };

export default function CheckoutModal({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const [f, setF] = useState({ email: "", email2: "", name: "", cpf: "", phone: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [pix, setPix] = useState<Pix | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(0);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupon, setCoupon] = useState<Applied | null>(null);
  const total = coupon ? coupon.totalCents : selection.priceCents;

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) { setCouponMsg("Digite o cupom"); return; }
    setCouponLoading(true); setCouponMsg("");
    try {
      const r = await fetch("/api/coupon", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, track: selection.track, plan: selection.plan }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Cupom inválido");
      setCoupon(d); setCouponInput("");
    } catch (e) {
      setCoupon(null); setCouponMsg(e instanceof Error ? e.message : "Cupom inválido");
    }
    setCouponLoading(false);
  }
  function removeCoupon() { setCoupon(null); setCouponMsg(""); }

  const errs = useMemo(() => ({
    email: isEmail(f.email) ? "" : "Email inválido",
    email2: f.email2.trim().toLowerCase() === f.email.trim().toLowerCase() && isEmail(f.email2) ? "" : "Os e-mails não coincidem",
    name: isName(f.name) ? "" : "Nome é obrigatório",
    cpf: isCpf(f.cpf) ? "" : "CPF inválido",
    phone: isPhone(f.phone) ? "" : "Telefone inválido",
  }), [f]);
  const valid = Object.values(errs).every((e) => !e) && agree;
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: k === "cpf" ? maskCpf(v) : k === "phone" ? maskPhone(v) : v }));
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  async function submit() {
    setTouched({ email: true, email2: true, name: true, cpf: true, phone: true });
    if (!valid) return;
    setError(""); setStep("loading");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: selection.track, plan: selection.plan, name: f.name, email: f.email, cpf: f.cpf, phone: f.phone, coupon: coupon?.code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao gerar o Pix");
      setPix(d); setStep("pix");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar o Pix"); setStep("form");
    }
  }

  useEffect(() => {
    if (step !== "pix" || !pix) return;
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`/api/checkout/status?id=${encodeURIComponent(pix.publicId)}`, { cache: "no-store" });
        const d = await r.json();
        if (d.status === "SETTLED") setStep("paid");
        else if (d.status === "FAILED" || d.status === "REJECTED") { setError("Pagamento não concluído. Gere um novo Pix."); setStep("form"); }
      } catch { /* tenta de novo */ }
    }, 4000);
    const tick = setInterval(() => setLeft(Math.max(0, Math.floor((new Date(pix.expiresAt).getTime() - Date.now()) / 1000))), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [step, pix]);

  async function copy() {
    if (!pix) return;
    try { await navigator.clipboard.writeText(pix.qrCodeText); }
    catch { const t = document.createElement("textarea"); t.value = pix.qrCodeText; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const qrSrc = pix ? (pix.qrCodeBase64 ? (pix.qrCodeBase64.startsWith("data:") ? pix.qrCodeBase64 : `data:image/png;base64,${pix.qrCodeBase64}`) : pix.qrCodeUrl) : null;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const field = (k: keyof typeof f, label: string, ph: string, type = "text", mode?: "numeric" | "email") => (
    <div className={`fld ${touched[k] && errs[k] ? "bad" : ""}`}>
      <label htmlFor={k}>{label}</label>
      <input id={k} type={type} inputMode={mode} placeholder={ph} value={f[k]} onChange={(e) => set(k, e.target.value)} onBlur={() => blur(k)} autoComplete={k === "email" ? "email" : k === "name" ? "name" : "off"} />
      {touched[k] && errs[k] && <em>{errs[k]}</em>}
    </div>
  );

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Finalizar pedido</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ border: 0, background: "none", fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        <div className="pcard">
          <div className="pthumb"><small>MENTORIA</small><b>{selection.title.split(" — ")[0]}</b></div>
          <div className="pinfo">
            <h4>{selection.title}</h4>
            <div className="pprice">{brl(total)}<small> à vista no Pix</small></div>
            {coupon && <div className="pold">de {brl(coupon.originalCents)}</div>}
          </div>
        </div>

        {(step === "form" || step === "loading") && (<>
          {error && <div className="err-box">{error}</div>}
          <div className="cupom">
            <button type="button" className="cupom-head" onClick={() => setCouponOpen((o) => !o)} aria-expanded={couponOpen}>
              <span>🎟️ Tem um cupom de desconto?</span><span className={`chev ${couponOpen ? "up" : ""}`}>⌄</span>
            </button>
            {couponOpen && (
              <div className="cupom-body">
                {coupon ? (
                  <div className="cupom-ok">
                    <span>Cupom <b>{coupon.code}</b> aplicado: {coupon.percent}% de desconto</span>
                    <button type="button" onClick={removeCoupon}>Remover</button>
                  </div>
                ) : (
                  <div className="cupom-row">
                    <input value={couponInput} placeholder="Digite seu Cupom" autoCapitalize="characters" autoComplete="off"
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }} />
                    <button type="button" disabled={couponLoading} onClick={applyCoupon}>{couponLoading ? "..." : "inserir ✓"}</button>
                  </div>
                )}
                {couponMsg && <div className="cupom-err">{couponMsg}</div>}
              </div>
            )}
          </div>
          {field("email", "Email", "aluno@email.com.br", "email", "email")}
          {field("email2", "Confirme seu e-mail", "aluno@email.com.br", "email", "email")}
          {field("name", "Nome Completo", "Seu nome completo")}
          {field("cpf", "CPF", "___.___.___-__", "text", "numeric")}
          {field("phone", "Celular", "Informe seu celular", "tel", "numeric")}
          <div className="method"><div>Pix</div></div>
          <div className="info"><b>Transação segura e confirmada na hora.</b><br />Você receberá o QR Code e o código copia e cola. O acesso é liberado assim que o pagamento é confirmado.</div>
          <div className="dcompra">
            <h5>Detalhes da Compra</h5>
            <div className="drow"><span>{selection.title}</span><span>{brl(selection.priceCents)}</span></div>
            {coupon && <div className="drow desc"><span>Cupom {coupon.code} (−{coupon.percent}%)</span><span>− {brl(coupon.discountCents)}</span></div>}
            <div className="dtotal"><span>Total</span><b>{brl(total)}</b></div>
          </div>
          <label className="terms"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Li e concordo com os termos de compra.</label>
          <button className="btn btn-pay" disabled={!valid || step === "loading"} onClick={submit}>{step === "loading" ? "Gerando Pix…" : "Finalizar Pedido ✓"}</button>
          {step === "loading" && <div className="skel" style={{ height: 14, marginTop: 14 }} />}
        </>)}

        {step === "pix" && pix && (<div className="center">
          <p><b>Pague com Pix</b> — expira em {mm}:{ss}</p>
          {qrSrc ? <img className="qr" src={qrSrc} alt="QR Code Pix" /> : <div className="skel qr" />}
          <div className="code">{pix.qrCodeText}</div>
          <div className="stack">
            <button className="btn btn-pay" onClick={copy}>{copied ? "Copiado ✓" : "Copiar código Pix"}</button>
            {pix.checkoutUrl && <a className="btn btn-ghost" style={{ color: "#1b1b2f", borderColor: "#cfd0e0" }} href={pix.checkoutUrl} target="_blank" rel="noopener noreferrer">Abrir página de pagamento</a>}
          </div>
          <p className="muted" style={{ marginTop: 12 }}>Aguardando confirmação do pagamento…</p>
        </div>)}

        {step === "paid" && (<div className="ok-box">
          <div className="big">✓</div><h3>Pagamento confirmado!</h3>
          <p className="muted">Enviaremos o acesso para {f.email}.</p>
          <button className="btn btn-pay" style={{ marginTop: 16 }} onClick={onClose}>Fechar</button>
        </div>)}
      </div>
    </div>
  );
}