"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

const L: Record<string, string> = {
  settings: "⚙️ Geral (marca, WhatsApp, SEO, rodapé)", theme: "🎨 Cores do site", sections: "📑 Seções (ordem e visibilidade)",
  hero: "Topo / Título", video: "Vídeo e botões", plans: "Planos e preços", renew: "Renovação ex-alunos", what: "O que é a Mentoria",
  steps: "Como funciona", forwho: "Para quem é", results: "Galeria de aprovados", testimonials: "Depoimentos", mentor: "Mentor",
  summary: "Resumindo + garantia", benefits: "Benefícios da carreira", banner: "Faixa de destaque", faq: "Perguntas frequentes", final: "Chamada final",
  brand: "Nome da marca", logo: "Logo (imagem)", metaTitle: "Título da aba (SEO)", metaDescription: "Descrição (SEO)", whatsapp: "WhatsApp (só números com DDI, ex: 5531999999999)",
  whatsappText: "Mensagem inicial do WhatsApp", waLabel: "Cartão WhatsApp: rótulo", waTitle: "Cartão WhatsApp: título", waText: "Cartão WhatsApp: texto", waCta: "Cartão WhatsApp: chamada",
  proof: "Prova social", guarantee: "Garantia (texto curto)", footerText: "Rodapé", footerSub: "Rodapé (linha 2)",
  bg: "Fundo", card: "Cartões", line: "Bordas", text: "Texto", muted: "Texto secundário", gold: "Dourado", goldLight: "Dourado claro", goldDark: "Dourado escuro",
  blue: "Azul", blueLight: "Azul claro", blueDark: "Azul escuro", band: "Faixa azul", accent: "Destaque (amarelo)",
  overline: "Texto pequeno acima", titleStart: "Título (início)", titleGold: "Título (destaque)", titleAccent: "Título (palavra colorida)", titleEnd: "Título (final)",
  subtitle: "Subtítulo", support: "Texto de apoio", image: "Imagem", stats: "Números de destaque", n: "Número", l: "Legenda", title: "Título", url: "Link do vídeo (YouTube, Vimeo ou .mp4)",
  poster: "Imagem de capa", buttons: "Botões", link: "Link (#planos, https://… )", note: "Observação", badges: "Selos", tracks: "Carreiras", sub: "Subtítulo/Ano",
  colorTheme: "Cor da carreira (gold = dourado, blue = azul)", label: "Rótulo", name: "Nome", price: "2) Preço real cobrado, sem cupom (R$)", oldPrice: "1) Preço antigo, aparece riscado (R$, 0 = oculto)", featured: "Destacar (Mais escolhido)",
  features: "Benefícios do plano", priceNote: "Texto abaixo do preço", cta: "Texto do botão", ribbon: "Etiqueta de destaque", receivesTitle: "Título 'Tudo que recebe'",
  receives: "Itens recebidos", payNote: "Nota de pagamento", button: "Texto do botão", items: "Itens", icon: "Ícone/Emoji", t: "Título", d: "Descrição", q: "Pergunta", a: "Resposta",
  images: "Imagens (URL ou envio)", role: "Cargo/Resultado", bullets: "Tópicos", guaranteeTitle: "Garantia: título", notFor: "Não é para quem", on: "Visível no site", id: "ID",
};
const lab = (k: string) => L[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const isImg = (k: string) => /^(image|images|logo|poster|foto)$/i.test(k);
const isColor = (v: any, k: string) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) && k !== "text";
const uid = () => "n" + Date.now().toString(36);
const blank = (v: any): any => Array.isArray(v) ? [] : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "id" ? uid() : blank(x)])) : typeof v === "number" ? 0 : typeof v === "boolean" ? false : "";
const title = (v: any, i: number) => typeof v === "string" ? v.slice(0, 50) || `Item ${i + 1}` : (Object.entries(v).find(([k, x]) => typeof x === "string" && k !== "id" && x && !/^#|^\/|^data:/.test(x as string))?.[1] as string)?.slice(0, 50) || `Item ${i + 1}`;

function shrink(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 1200 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
        cv.width = img.width * s; cv.height = img.height * s;
        cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
        res(cv.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.82));
      };
      img.onerror = rej; img.src = r.result as string;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

function Node({ k, v, set, fixed }: { k: string; v: any; set: (x: any) => void; fixed?: boolean }) {
  if (k === "id" && !fixed) return null;
  if (typeof v === "boolean") return <label className="r"><input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} /> {lab(k)}</label>;
  if (typeof v === "number") return <div className="f"><label>{lab(k)}</label><input type="number" step="0.01" value={v} onChange={(e) => set(Number(e.target.value))} /></div>;
  if (typeof v === "string") {
    if (isImg(k)) return (
      <div className="f"><label>{lab(k)}</label>
        <div className="img">{v && <img src={v} alt="" />}
          <input value={v.startsWith("data:") ? "(imagem enviada)" : v} readOnly={v.startsWith("data:")} placeholder="https://… ou envie um arquivo" onChange={(e) => set(e.target.value)} />
          <label className="up">Enviar<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) set(await shrink(f)); }} /></label>
          {v && <button type="button" className="x" onClick={() => set("")}>limpar</button>}
        </div></div>);
    if (isColor(v, k)) return <div className="f"><label>{lab(k)}</label><div className="r"><input type="color" value={v} onChange={(e) => set(e.target.value)} /><input value={v} onChange={(e) => set(e.target.value)} /></div></div>;
    const long = v.length > 60 || /^(text|d|a|subtitle|support|guarantee|metaDescription)$/.test(k);
    return <div className="f"><label>{lab(k)}</label>{long ? <textarea rows={3} value={v} onChange={(e) => set(e.target.value)} /> : <input value={v} onChange={(e) => set(e.target.value)} />}</div>;
  }
  if (Array.isArray(v)) {
    const fixedList = k === "sections";
    const mv = (i: number, d: number) => { const a = [...v], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set(a); };
    const tpl = v[0] ?? "";
    return (
      <div className="f"><label>{lab(k)} <small>({v.length})</small></label>
        {v.map((it, i) => (
          <div className="it" key={i}>
            <div className="ith"><b>{typeof it === "object" ? title(it, i) : ""}</b>
              <span><button type="button" onClick={() => mv(i, -1)}>↑</button><button type="button" onClick={() => mv(i, 1)}>↓</button>
                {!fixedList && <button type="button" className="x" onClick={() => confirm("Remover este item?") && set(v.filter((_: any, j: number) => j !== i))}>✕</button>}</span></div>
            {typeof it === "object" ? <Node k="_" v={it} fixed={fixedList} set={(x) => set(v.map((o: any, j: number) => j === i ? x : o))} />
              : <Node k={k} v={it} set={(x) => set(v.map((o: any, j: number) => j === i ? x : o))} />}
          </div>))}
        {!fixedList && <button type="button" className="add" onClick={() => set([...v, blank(tpl)])}>+ Adicionar</button>}
      </div>);
  }
  if (v && typeof v === "object") {
    const ent = Object.entries(v).filter(([kk]) => fixed || kk !== "id");
    const oi = ent.findIndex(([kk]) => kk === "oldPrice"), pi = ent.findIndex(([kk]) => kk === "price");
    if (oi > pi && pi >= 0) ent.splice(pi, 0, ent.splice(oi, 1)[0]);
    return <div className={k === "_" ? "" : "grp"}>{k !== "_" && <h4>{lab(k)}</h4>}{ent.map(([kk, x]) => (
      kk === "label" && fixed ? <div className="f" key={kk}><label>Seção</label><b>{String(x)}</b></div> :
      kk === "id" ? null : <Node key={kk} k={kk} v={x} fixed={fixed} set={(n) => set({ ...v, [kk]: n })} />))}</div>;
  }
  return null;
}

export default function Admin() {
  const [state, setState] = useState<"load" | "login" | "edit">("load");
  const [data, setData] = useState<any>(null);
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [msg, setMsg] = useState(""); const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await fetch("/api/admin/content", { cache: "no-store" });
    if (r.status === 401) return setState("login");
    setData(await r.json()); setState("edit");
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { const f = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; addEventListener("beforeunload", f); return () => removeEventListener("beforeunload", f); }, [dirty]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: u, pass: p }) });
    setBusy(false);
    if (!r.ok) return setMsg((await r.json()).error || "Erro");
    setP(""); load();
  }
  async function save() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setBusy(false);
    if (r.ok) { setDirty(false); setMsg("✓ Salvo! O site já está atualizado."); } else setMsg("⚠ " + ((await r.json()).error || "Erro ao salvar"));
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); setData(null); setState("login"); }

  if (state === "load") return <div className="ad"><style>{CSS}</style><p style={{ padding: 30 }}>Carregando…</p></div>;
  if (state === "login") return (
    <div className="ad"><style>{CSS}</style>
      <form className="login" onSubmit={login}>
        <h1>Painel administrativo</h1><p>Entre para editar o site.</p>
        <label>Nome</label><input autoFocus autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} />
        <label>Senha</label><input type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} />
        {msg && <div className="msg bad">{msg}</div>}
        <button className="save" disabled={busy || !u || !p}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>);
  const order = ["sections", "settings", "theme", "hero", "video", "plans", "renew", "what", "steps", "forwho", "results", "testimonials", "mentor", "summary", "benefits", "banner", "faq", "final"];
  const keys = [...order.filter((k) => k in data), ...Object.keys(data).filter((k) => !order.includes(k))];
  return (
    <div className="ad"><style>{CSS}</style>
      <header><b>Painel · editar site</b><span><a href="/" target="_blank" rel="noreferrer">Ver site ↗</a><button onClick={logout}>Sair</button></span></header>
      <main>
        <p className="hint">Abra cada bloco, edite e clique em <b>Salvar alterações</b>. Tudo do site é editável: textos, imagens, cores, preços, links, ordem e visibilidade das seções.</p>
        {keys.map((k) => (
          <details key={k} className="blk"><summary>{L[k] ?? lab(k)}</summary>
            <Node k="_" v={data[k]} fixed={k === "sections"} set={(x) => { setData({ ...data, [k]: x }); setDirty(true); setMsg(""); }} />
          </details>))}
      </main>
      <footer><span className={msg.startsWith("⚠") ? "bad" : "ok"}>{msg || (dirty ? "Alterações não salvas" : "")}</span><button className="save" disabled={busy || !dirty} onClick={save}>{busy ? "Salvando…" : "Salvar alterações"}</button></footer>
    </div>);
}

const CSS = `
.ad{min-height:100vh;background:#0b0b0d;color:#eee;font:15px system-ui,sans-serif;padding-bottom:90px}
.ad *{box-sizing:border-box}.ad header{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#111114;border-bottom:1px solid #26262c}
.ad header span{display:flex;gap:12px;align-items:center}.ad header a{color:#c8a86a}
.ad button{font:inherit;cursor:pointer}.ad header button{background:none;border:1px solid #444;color:#ddd;border-radius:6px;padding:6px 12px}
.ad main{max-width:760px;margin:0 auto;padding:16px}.hint{color:#9a9aa5;font-size:13px;margin-bottom:14px}
.blk{background:#131316;border:1px solid #26262c;border-radius:12px;margin-bottom:10px}.blk>summary{padding:14px 16px;cursor:pointer;font-weight:600}
.blk[open]>summary{border-bottom:1px solid #26262c;color:#c8a86a}.blk>div{padding:14px 16px}
.f{margin-bottom:14px}.f>label,.login label{display:block;font-size:12px;color:#a9a9b4;margin-bottom:5px}
.ad input:not([type=checkbox]):not([type=color]),.ad textarea{width:100%;background:#0b0b0d;border:1px solid #33333b;border-radius:8px;color:#fff;padding:10px;font:inherit}
.ad input:focus,.ad textarea:focus{outline:2px solid #c8a86a;border-color:transparent}
.r{display:flex;align-items:center;gap:10px;margin-bottom:10px}.r input[type=color]{width:44px;height:38px;border:0;background:none;padding:0}
.grp{border-left:2px solid #2d2a20;padding-left:12px;margin:6px 0 14px}.grp h4{font-size:13px;color:#c8a86a;margin-bottom:10px}
.it{border:1px solid #2a2a31;border-radius:10px;padding:12px;margin-bottom:10px;background:#0f0f12}
.ith{display:flex;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:13px}.ith span{display:flex;gap:4px;flex:none}
.ith button,.x{background:#1c1c21;border:1px solid #38383f;color:#ddd;border-radius:6px;padding:3px 9px}.x{color:#ff7a8f}
.add{width:100%;background:none;border:1px dashed #555;color:#c8a86a;border-radius:8px;padding:10px}
.img{display:grid;gap:8px}.img img{max-height:120px;max-width:100%;border-radius:8px;object-fit:contain;justify-self:start;border:1px solid #33333b;background:#000}
.up{display:inline-block;justify-self:start;background:#1c1c21;border:1px solid #38383f;border-radius:6px;padding:7px 14px;cursor:pointer;color:#ddd!important;font-size:13px!important;margin:0!important}
.ad footer{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#111114;border-top:1px solid #26262c}
.save{background:linear-gradient(180deg,#e2cb97,#9c7f47);color:#16110a;border:0;border-radius:8px;padding:12px 20px;font-weight:700}.save:disabled{opacity:.45}
.ok{color:#2fbf71}.bad{color:#ff7a8f}.msg{margin:10px 0}
.login{max-width:360px;margin:12vh auto 0;padding:26px;background:#131316;border:1px solid #26262c;border-radius:16px}.login h1{font-size:22px;margin-bottom:4px}.login p{color:#9a9aa5;margin-bottom:18px}.login input{margin-bottom:14px}.login .save{width:100%;margin-top:6px}
`;