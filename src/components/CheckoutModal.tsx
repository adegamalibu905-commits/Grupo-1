"use client";
import { useEffect, useMemo, useState } from "react";
import { isCpf, isEmail, isName, isPhone, maskCpf, maskPhone } from "@/lib/validate";
import { THUMB } from "@/lib/thumb";
import "./checkout.css";

// ====== EDITE AQUI ======
const BRAND_TAG = "[Mentoria OBA]";                 // nome que aparece antes da carreira
const SELLER = "PMMinas Negócios Digitais LTDA";    // texto "Curso ofertado por"
// ========================

const money = (c: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100);

export type Selection = { track: string; plan: string; title: string; priceCents: number; originalCents: number };
type Pix = { publicId: string; expiresAt: string; qrCodeText: string; qrCodeBase64: string | null; qrCodeUrl: string | null; checkoutUrl: string };
type Step = "form" | "loading" | "pix" | "paid";
type Applied = { code: string; percent: number; originalCents: number; discountCents: number; totalCents: number };

export default function CheckoutModal({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const [f, setF] = useState({ email: "", email2: "", name: "", cpf: "", phone: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
  const original = selection.originalCents;
  const discount = original - total;
  const [trackLabel, planName = ""] = selection.title.split(" — ");
  const months = planName.match(/\d+/)?.[0];
  const productShort = `🎖️ ${BRAND_TAG} ${trackLabel.toUpperCase()}`;
  const productFull = months ? `${productShort} - ${months} MESES` : productShort;

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
  const valid = Object.values(errs).every((e) => !e);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: k === "cpf" ? maskCpf(v) : k === "phone" ? maskPhone(v) : v }));
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  async function submit() {
    setTouched({ email: true, email2: true, name: true, cpf: true, phone: true });
    if (!valid) {
      const first = (["email", "email2", "name", "cpf", "phone"] as const).find((k) => errs[k]);
      if (first) {
        const el = document.getElementById(first);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus();
      }
      return;
    }
    setError(""); setStep("loading");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: selection.track, plan: selection.plan, name: f.name, email: f.email, cpf: f.cpf, phone: f.phone, coupon: coupon?.code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao gerar o Pix");
      setLeft(Math.max(0, Math.floor((new Date(d.expiresAt).getTime() - Date.now()) / 1000)));
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
        {/* TOPO (igual à 2ª imagem) */}
        <div className="ck-top">
          <img className="ck-thumb" src={THUMB} alt={productFull} />
          <div className="ck-info">
            <h4>{productFull}</h4>
            <p className="ck-course">Curso: {productShort}</p>
            <div className="ck-small">à vista no Pix</div>
            <div className="ck-price">{money(total)}</div>
            {discount > 0 && <div className="ck-old">de {money(original)}</div>}
            <p className="ck-access">{planName}</p>
          </div>
        </div>
        <hr className="ck-line" />

        {(step === "form" || step === "loading") && (<>
          {error && <div className="err-box">{error}</div>}

          {/* CUPOM (logo abaixo do preço) */}
          <div className="ck-cupom">
            <button type="button" className="ck-cupom-head" onClick={() => setCouponOpen((o) => !o)} aria-expanded={couponOpen}>
              <span>🎟️ Tem um cupom de desconto?</span><span className={`ck-chev ${couponOpen ? "up" : ""}`}>⌄</span>
            </button>
            {couponOpen && (
              <div className="ck-cupom-body">
                {coupon ? (
                  <div className="ck-cupom-ok">
                    <span>Cupom <b>{coupon.code}</b> aplicado: {coupon.percent}% de desconto</span>
                    <button type="button" onClick={removeCoupon}>Remover</button>
                  </div>
                ) : (
                  <div className="ck-cupom-row">
                    <input value={couponInput} placeholder="Digite seu Cupom" autoCapitalize="characters" autoComplete="off"
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }} />
                    <button type="button" disabled={couponLoading} onClick={applyCoupon}>{couponLoading ? "..." : "inserir ✓"}</button>
                  </div>
                )}
                {couponMsg && <div className="ck-cupom-err">{couponMsg}</div>}
              </div>
            )}
          </div>

          {field("email", "Email", "aluno@email.com.br", "email", "email")}
          {field("email2", "Confirme seu e-mail", "aluno@email.com.br", "email", "email")}
          {field("name", "Nome Completo", "Seu nome completo")}
          {field("cpf", "CPF", "___.___.___-__", "text", "numeric")}
          {field("phone", "Celular", "Informe seu celular", "tel", "numeric")}

          {/* BLOCO IGUAL À 1ª IMAGEM */}
          <div className="ck-box">
            <h5>
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="13" fill="#6366f1" /><path d="M13 6.5V13l4 2.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Transação segura e confirmada na hora
            </h5>
            <p>O pagamento com Pix leva poucos segundos usando a tecnologia do Banco Central para garantir a proteção dos seus dados em uma transação segura. Copie o código ou leia o QR Code para pagar</p>
          </div>

          <div className="ck-det">
            <h5>Detalhes da Compra</h5>
            <div className="ck-row"><span>{productShort}</span><b>{money(original)}</b></div>
            {discount > 0 && <div className="ck-row desc"><span>{coupon ? `Cupom ${coupon.code} (−${coupon.percent}%)` : `Desconto à vista no Pix (−${Math.round((discount / original) * 100)}%)`}</span><b>− {money(discount)}</b></div>}
            <div className="ck-total"><span>Total</span><b>{money(total)}</b></div>
          </div>

          <button className="ck-fin" disabled={step === "loading"} onClick={submit}>Finalizar Pedido ✓</button>
          {step === "loading" && <div className="ck-wait"><span className="ck-spin" />Aguardando validação do seu dispositivo...</div>}

          <div className="ck-secure">
            <svg width="30" height="32" viewBox="0 0 30 32" aria-hidden="true"><rect x="2" y="13" width="26" height="18" rx="4" fill="#6b7280" /><path d="M8 13V9a7 7 0 0 1 14 0v4" stroke="#6b7280" strokeWidth="3.5" fill="none" /><circle cx="15" cy="22" r="2.4" fill="#fff" /></svg>
            <span>Ambiente totalmente <b>seguro</b> e <b>protegido</b> contra fraudes.</span>
          </div>

          <div className="ck-legal">
            Curso ofertado por: {SELLER}<br />
            Ao clicar em <b>Finalizar Pedido</b>, eu concordo (i) que estou de acordo com os <b>Termos de Compra</b>; (ii) que li e estou ciente da <b>Política de Privacidade</b>; (iii) que concordo com os <b>Termos de Uso</b>; e (iv) que sou maior de idade ou autorizado e acompanhado por um tutor legal.
          </div>
        </>)}

        {step === "pix" && pix && (<div className="center">
          <p><b>Pague com Pix</b> — {left > 0 ? `expira em ${mm}:${ss}` : "Pix expirado"}</p>
          {qrSrc ? <img className="qr" src={qrSrc} alt="QR Code Pix" /> : <div className="skel qr" />}
          <div className="code">{pix.qrCodeText}</div>
          <div className="stack">
            <button className="btn btn-pay" onClick={copy}>{copied ? "Copiado ✓" : "Copiar código Pix"}</button>
            {pix.checkoutUrl && <a className="btn btn-ghost" style={{ color: "#1b1b2f", borderColor: "#cfd0e0" }} href={pix.checkoutUrl} target="_blank" rel="noopener noreferrer">Abrir página de pagamento</a>}
          </div>
          {left > 0
            ? <p className="muted" style={{ marginTop: 12 }}>Aguardando confirmação do pagamento…</p>
            : <button className="btn btn-pay" style={{ marginTop: 12 }} onClick={() => { setPix(null); setStep("form"); }}>Gerar novo Pix</button>}
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