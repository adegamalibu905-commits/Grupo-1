"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CONTENT } from "@/config/site";
import { ALL_PAGES, CATEGORIES, catOf, coveredPaths, getIn, pageById, setIn, type Page } from "@/admin/schema";
import { Fields, Toggle } from "@/admin/fields";
import "./admin.css";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const MAX_BYTES = 6_000_000;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export default function Admin() {
  const [phase, setPhase] = useState<"load" | "login" | "edit">("load");
  const [data, setData] = useState<any>(null);
  const dataRef = useRef<any>(null);
  const [pageId, setPageId] = useState("home");
  const [q, setQ] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"menu" | "edit" | "view">("menu");
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ t: "ok" | "bad"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState(0);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [lmsg, setLmsg] = useState("");
  const [ready, setReady] = useState(0);
  const [, force] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const hist = useRef<{ past: any[]; future: any[]; at: number; pg: string }>({ past: [], future: [], at: 0, pg: "" });
  const pend = useRef<Set<string>>(new Set());
  const timer = useRef<any>(null);
  const pageIdRef = useRef(pageId); pageIdRef.current = pageId;

  const post = useCallback((m: any) => frame.current?.contentWindow?.postMessage(m, location.origin), []);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/content", { cache: "no-store" });
    if (r.status === 401) return setPhase("login");
    const d = await r.json(); dataRef.current = d; setData(d); setPhase("edit");
  }, []);
  useEffect(() => { load(); try { const d = localStorage.getItem("adm-device"); if (d === "mobile" || d === "desktop") setDevice(d); } catch { /* ok */ } }, [load]);
  useEffect(() => { try { localStorage.setItem("adm-device", device); } catch { /* ok */ } }, [device]);

  // ---- aviso de alterações não salvas
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => { if (changed.size) { e.preventDefault(); e.returnValue = ""; } };
    addEventListener("beforeunload", f); return () => removeEventListener("beforeunload", f);
  }, [changed]);

  // ---- tamanho do conteúdo
  useEffect(() => { if (!data) return; const t = setTimeout(() => setSize(JSON.stringify(data).length), 500); return () => clearTimeout(t); }, [data]);

  // ---- toast some sozinho
  useEffect(() => { if (toast?.t === "ok") { const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); } }, [toast]);

  // ---- prévia: mensagens vindas do iframe
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data; if (!m || typeof m !== "object") return;
      if (m.type === "ready") { if (dataRef.current) post({ type: "full", data: dataRef.current }); setReady((n) => n + 1); }
      if (m.type === "select") {
        const pg = ALL_PAGES.find((x) => x.sec === m.id) ?? ALL_PAGES.find((x) => x.toggle === m.id);
        if (pg) { setPageId(pg.id); setTab("edit"); }
        else if (m.id === "wa") { setPageId("whatsapp"); setTab("edit"); }
      }
      if (m.type === "checkoutClosed" && pageById(pageIdRef.current)?.view === "checkout") post({ type: "checkout", open: true });
    };
    addEventListener("message", on); return () => removeEventListener("message", on);
  }, [post]);

  // ---- prévia: acompanha a tela que está sendo editada
  useEffect(() => {
    if (phase !== "edit") return;
    const pg = pageById(pageId);
    if (!pg) { post({ type: "view", view: "site" }); post({ type: "checkout", open: false }); post({ type: "focus", id: "" }); return; }
    post({ type: "view", view: pg.view === "thanks" ? "thanks" : "site" });
    post({ type: "checkout", open: pg.view === "checkout" });
    post({ type: "focus", id: pg.view ? "" : pg.sec ?? "", label: pg.title, delay: pg.view === "thanks" ? 250 : 80 });
  }, [pageId, phase, ready, post]);

  const flush = useCallback(() => {
    const keys = Array.from(pend.current); pend.current.clear();
    for (const k of keys) post({ type: "patch", key: k, value: dataRef.current[k] });
    if (keys.includes("sections")) { const pg = pageById(pageIdRef.current); if (pg && !pg.view) post({ type: "focus", id: pg.sec ?? "", label: pg.title, delay: 200 }); }
  }, [post]);

  const commit = useCallback((next: any, opts?: { keepHist?: boolean }) => {
    const prev = dataRef.current; if (!next || next === prev) return;
    if (!opts?.keepHist) {
      const h = hist.current, now = Date.now();
      if (!(now - h.at < 900 && h.pg === pageIdRef.current && h.past.length)) { h.past.push(prev); if (h.past.length > 60) h.past.shift(); }
      h.at = now; h.pg = pageIdRef.current; h.future = [];
    }
    dataRef.current = next; setData(next);
    for (const k of Object.keys(next)) if (next[k] !== prev[k]) pend.current.add(k);
    clearTimeout(timer.current); timer.current = setTimeout(flush, 110);
    setChanged((c) => (c.has(pageIdRef.current) ? c : new Set(c).add(pageIdRef.current)));
  }, [flush]);

  const undo = () => { const h = hist.current; const prev = h.past.pop(); if (!prev) return; h.future.push(dataRef.current); h.at = 0; commit(prev, { keepHist: true }); force((n) => n + 1); };
  const redo = () => { const h = hist.current; const nx = h.future.pop(); if (!nx) return; h.past.push(dataRef.current); h.at = 0; commit(nx, { keepHist: true }); force((n) => n + 1); };

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setLmsg("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user: u, pass: p }) });
    setBusy(false);
    if (!r.ok) return setLmsg((await r.json().catch(() => ({}))).error || "Não foi possível entrar");
    setP(""); load();
  }
  const save = useCallback(async () => {
    if (busy || !dataRef.current) return;
    setBusy(true); setToast(null);
    try {
      const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dataRef.current) });
      if (r.ok) { setChanged(new Set()); setToast({ t: "ok", m: "Publicado! O site já está atualizado." }); }
      else setToast({ t: "bad", m: (await r.json().catch(() => ({}))).error || "Não foi possível salvar. Tente de novo." });
    } catch { setToast({ t: "bad", m: "Sem conexão. Suas alterações continuam aqui; tente salvar de novo." }); }
    setBusy(false);
  }, [busy]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); } };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [save]);
  async function logout() {
    if (changed.size && !confirm("Existem alterações que ainda não foram salvas. Sair mesmo assim?")) return;
    await fetch("/api/admin/login", { method: "DELETE" }); setData(null); setChanged(new Set()); setPhase("login");
  }

  const go = (id: string) => { setPageId(id); setTab("edit"); };
  const page = pageById(pageId);
  const cat = page ? catOf(page.id) : undefined;
  const hits = useMemo(() => {
    const s = norm(q.trim()); if (!s) return null;
    return ALL_PAGES.filter((x) => norm(`${x.title} ${x.kw} ${x.where} ${catOf(x.id)?.title ?? ""}`).includes(s));
  }, [q]);

  const resetPage = (pg: Page) => {
    if (!pg.fields) return;
    if (!confirm(`Voltar tudo da tela “${pg.title}” para o texto original que veio com o site?\n\nVocê poderá desfazer com o botão “Desfazer”.`)) return;
    let n = dataRef.current;
    for (const path of Array.from(coveredPaths(pg.fields)).filter((x) => !x.includes("[]."))) { const d = getIn(DEFAULT_CONTENT, path); if (d !== undefined) n = setIn(n, path, clone(d)); }
    commit(n);
  };

  // ============ LOGIN ============
  if (phase === "load") return <div className="ad center"><p className="loading">Carregando o painel…</p></div>;
  if (phase === "login") return (
    <div className="ad center">
      <form className="login" onSubmit={login}>
        <div className="lg">🛠️</div>
        <h1>Painel do site</h1>
        <p>Entre para editar textos, fotos, preços e cores do seu site.</p>
        <label>Seu nome de usuário</label><input autoFocus autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} />
        <label>Sua senha</label><input type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} />
        {lmsg && <div className="lerr">⚠ {lmsg}</div>}
        <button className="savebtn" disabled={busy || !u || !p}>{busy ? "Entrando…" : "Entrar no painel"}</button>
      </form>
    </div>);

  const pct = Math.min(100, Math.round((size / MAX_BYTES) * 100));
  const dirty = changed.size > 0;
  const h = hist.current;

  return (
    <div className={`ad app tab-${tab}`}>
      {/* ===== BARRA DE CIMA ===== */}
      <header className="top">
        <button className="brand" onClick={() => go("home")}>🛠️ <b>Painel do site</b></button>
        <div className="tmid">
          <button className="tb" onClick={undo} disabled={!h.past.length} title="Desfaz a última alteração">↶ Desfazer</button>
          <button className="tb" onClick={redo} disabled={!h.future.length} title="Refaz o que foi desfeito">↷ Refazer</button>
          <span className={`stat ${dirty ? "d" : "k"}`}>{dirty ? "● Alterações ainda não publicadas" : "✓ Tudo publicado"}</span>
        </div>
        <div className="tright">
          <a className="tb" href="/" target="_blank" rel="noreferrer">Ver site publicado ↗</a>
          <button className="tb" onClick={logout}>Sair</button>
          <button className="savebtn" disabled={busy || !dirty} onClick={save} title="Atalho: Ctrl + S">{busy ? "Publicando…" : "💾 Salvar e publicar"}</button>
        </div>
      </header>

      {toast && <div className={`toast ${toast.t}`} role="status">{toast.t === "ok" ? "✓ " : "⚠ "}{toast.m}{toast.t === "ok" && <a href="/" target="_blank" rel="noreferrer"> Abrir o site ↗</a>}<button onClick={() => setToast(null)} aria-label="Fechar">✕</button></div>}

      <nav className="tabs">
        {(["menu", "edit", "view"] as const).map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "menu" ? "📂 Menu" : t === "edit" ? "✏️ Editar" : "👁 Ver site"}</button>)}
      </nav>

      <div className="shell">
        {/* ===== MENU ===== */}
        <aside className="menu">
          <input className="search" placeholder="🔍 Buscar (ex.: preço, WhatsApp, cor)" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className={`mi home ${pageId === "home" ? "on" : ""}`} onClick={() => { setQ(""); go("home"); }}>🏠 Início e ajuda</button>
          {hits ? (
            <div className="cat"><div className="ch">Resultados ({hits.length})</div>
              {hits.map((x) => <button key={x.id} className={`mi ${pageId === x.id ? "on" : ""}`} onClick={() => { setQ(""); go(x.id); }}><i>{x.icon}</i><span>{x.title}<small>{catOf(x.id)?.title}</small></span></button>)}
              {!hits.length && <p className="none">Nada encontrado. Tente outra palavra.</p>}
            </div>
          ) : CATEGORIES.map((c) => (
            <div className="cat" key={c.id}>
              <div className="ch"><i>{c.icon}</i> {c.title}</div>
              {c.pages.map((x) => {
                const off = x.toggle && data.sections.find((s: any) => s.id === x.toggle)?.on === false;
                return (
                  <button key={x.id} className={`mi ${pageId === x.id ? "on" : ""}`} onClick={() => go(x.id)}>
                    <i>{x.icon}</i><span>{x.title}</span>
                    {changed.has(x.id) && <em className="dot" title="Alterado e ainda não publicado">●</em>}
                    {off && <em className="off" title="Esta seção está desligada no site">oculta</em>}
                  </button>);
              })}
            </div>
          ))}
        </aside>

        {/* ===== EDITOR ===== */}
        <section className="editor">
          {pageId === "home" || !page ? <Home go={go} /> : (
            <>
              <div className="phead">
                <div className="crumb"><button onClick={() => go("home")}>Início</button> › <span>{cat?.icon} {cat?.title}</span> › <b>{page.title}</b></div>
                <h2><span>{page.icon}</span> {page.title}</h2>
                <div className="where"><b>📍 Onde aparece no site:</b> {page.where}</div>
                <div className="pact">
                  {(page.sec || page.view) && <button className="tb" onClick={() => { setTab("view"); post({ type: "focus", id: page.view ? "" : page.sec, label: page.title }); }}>👁 Mostrar no site</button>}
                  {page.fields && <button className="tb" onClick={() => resetPage(page)}>↺ Voltar ao texto original</button>}
                </div>
                {page.toggle && (() => {
                  const sec = data.sections.find((s: any) => s.id === page.toggle);
                  if (!sec) return null;
                  return sec.on
                    ? <div className="vis"><Toggle on label="Esta seção está aparecendo no site" onChange={() => commit({ ...dataRef.current, sections: dataRef.current.sections.map((s: any) => (s.id === sec.id ? { ...s, on: false } : s)) })} /></div>
                    : <div className="note warn vis">⚠️ Esta seção está <b>desligada</b> e por isso não aparece no site nem na prévia. <button className="tb pri" onClick={() => commit({ ...dataRef.current, sections: dataRef.current.sections.map((s: any) => (s.id === sec.id ? { ...s, on: true } : s)) })}>Ligar agora</button></div>;
                })()}
              </div>
              <div className="pbody">
                {page.custom === "sections"
                  ? <SectionsEditor data={data} commit={commit} go={(id) => { const pg = ALL_PAGES.find((x) => x.toggle === id); if (pg) go(pg.id); }} show={(id) => { setTab("view"); post({ type: "focus", id, label: data.sections.find((s: any) => s.id === id)?.label }); }} />
                  : page.fields && <Fields fields={page.fields} base={data} onBase={(nb) => commit(nb)} />}
              </div>
            </>
          )}
        </section>

        {/* ===== PRÉVIA ===== */}
        <section className="viewer">
          <div className="vbar">
            <b>👁 Como o site está ficando</b>
            <span className="vmode">
              <button className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>🖥 Computador</button>
              <button className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}>📱 Celular</button>
            </span>
            <span className="vtip">Clique em qualquer parte do site para editar</span>
          </div>
          <div className="vframe"><div className={`vdev ${device}`}><iframe ref={frame} src="/preview" title="Prévia do site" /></div></div>
          <div className="vfoot">
            <span>Tamanho do conteúdo: <b>{(size / 1e6).toFixed(2)} MB</b> de 6 MB</span>
            <i className="bar"><u style={{ width: pct + "%" }} className={pct > 85 ? "hot" : ""} /></i>
            {pct > 85 && <span className="warn">Quase no limite. Use fotos menores.</span>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Home({ go }: { go: (id: string) => void }) {
  return (
    <div className="home">
      <h2>👋 Bem-vindo ao painel do seu site</h2>
      <p className="lead">Aqui você muda tudo do site sem mexer em código. Do lado direito você vê a página sendo alterada na hora.</p>
      <div className="steps">
        <div><b>1</b><span>Escolha o que quer mudar no <u>menu da esquerda</u>.</span></div>
        <div><b>2</b><span>Edite os campos. A <u>prévia à direita</u> mostra o resultado e destaca onde você está mexendo.</span></div>
        <div><b>3</b><span>Gostou? Clique em <u>Salvar e publicar</u>, no canto de cima.</span></div>
      </div>
      <div className="note info">💡 Dica: clique direto em qualquer parte do site, na prévia, para abrir a tela de edição daquela parte.</div>
      <h3>O que você quer fazer?</h3>
      <div className="quick">
        {[["planos-precos", "💵", "Mudar preços dos planos"], ["whatsapp", "💬", "Trocar o WhatsApp"], ["hero", "🏁", "Mudar o título principal"], ["ordem", "📑", "Mudar ordem das seções"], ["cores", "🎨", "Mudar as cores"], ["coupons", "🎟️", "Criar um cupom"]].map(([id, ic, t]) => (
          <button key={id} onClick={() => go(id)}><i>{ic}</i>{t}</button>))}
      </div>
      <h3>Tudo o que dá para editar</h3>
      <div className="cards">
        {CATEGORIES.map((c) => (
          <div className="card" key={c.id}>
            <h4><i>{c.icon}</i> {c.title}</h4><p>{c.desc}</p>
            <div>{c.pages.map((x) => <button key={x.id} onClick={() => go(x.id)}>{x.icon} {x.title}</button>)}</div>
          </div>))}
      </div>
    </div>
  );
}

function SectionsEditor({ data, commit, go, show }: { data: any; commit: (d: any) => void; go: (id: string) => void; show: (id: string) => void }) {
  const list: { id: string; label: string; on: boolean }[] = data.sections;
  const set = (a: typeof list) => commit({ ...data, sections: a });
  const mv = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const a = [...list]; [a[i], a[j]] = [a[j], a[i]]; set(a); };
  return (
    <>
      <div className="note info">ℹ️ A lista abaixo é a página de cima para baixo. Use as setas para mudar a ordem e o interruptor para mostrar ou esconder cada parte.</div>
      <div className="slist">
        {list.map((s, i) => (
          <div key={s.id} className={`srow ${s.on ? "" : "off"}`}>
            <span className="sn">{i + 1}</span>
            <span className="sl"><b>{s.label}</b>{!s.on && <small>Desligada — não aparece no site</small>}</span>
            <span className="sa">
              <Toggle on={s.on} label="" onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
              <button className="tb" onClick={() => mv(i, -1)} disabled={i === 0} title="Subir">↑</button>
              <button className="tb" onClick={() => mv(i, 1)} disabled={i === list.length - 1} title="Descer">↓</button>
              <button className="tb" onClick={() => show(s.id)} title="Mostrar na prévia">👁</button>
              <button className="tb" onClick={() => go(s.id)} title="Editar o conteúdo">✏️</button>
            </span>
          </div>))}
      </div>
    </>
  );
}