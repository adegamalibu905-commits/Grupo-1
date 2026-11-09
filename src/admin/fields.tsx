"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { blankOf, getIn, setIn, type Field } from "./schema";

export function shrink(file: File, max = 1200): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement("canvas");
        cv.width = Math.max(1, Math.round(img.width * s)); cv.height = Math.max(1, Math.round(img.height * s));
        cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
        res(cv.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.82));
      };
      img.onerror = () => rej(new Error("Imagem inválida")); img.src = r.result as string;
    };
    r.onerror = () => rej(new Error("Falha ao ler o arquivo")); r.readAsDataURL(file);
  });
}

function Box({ label, help, children, wide }: { label: string; help?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`fb ${wide ? "wide" : ""}`}>
      {label && <div className="fl">{label}</div>}
      {help && <div className="fh">{help}</div>}
      {children}
    </div>
  );
}

function Num({ value, onChange, step, prefix, suffix }: { value: number; onChange: (n: number) => void; step?: number; prefix?: string; suffix?: string }) {
  const [txt, setTxt] = useState(String(value ?? 0));
  useEffect(() => { if (Number(txt) !== Number(value)) setTxt(String(value ?? 0)); /* eslint-disable-next-line */ }, [value]);
  return (
    <div className="num">{prefix && <span>{prefix}</span>}
      <input type="number" inputMode="decimal" step={step ?? 1} value={txt} onChange={(e) => { setTxt(e.target.value); onChange(e.target.value === "" ? 0 : Number(e.target.value)); }} />
      {suffix && <span>{suffix}</span>}</div>
  );
}

function RichInput({ value, onChange, rows = 3 }: { value: string; onChange: (s: string) => void; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const bold = () => {
    const el = ref.current; if (!el) return;
    const a = el.selectionStart, b = el.selectionEnd, v = el.value;
    const sel = v.slice(a, b);
    const nv = sel.startsWith("**") && sel.endsWith("**") && sel.length > 4 ? v.slice(0, a) + sel.slice(2, -2) + v.slice(b) : v.slice(0, a) + "**" + sel + "**" + v.slice(b);
    onChange(nv);
    requestAnimationFrame(() => { el.focus(); const p = sel ? a + sel.length + 4 : a + 2; el.setSelectionRange(sel ? a : p, sel ? a + sel.length + 4 : p); });
  };
  return (
    <div className="rich">
      <div className="rtool"><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={bold} title="Deixa o texto selecionado em negrito"><b>N</b> Negrito</button></div>
      <textarea ref={ref} rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [url, setUrl] = useState(false);
  const pick = async (f?: File) => { if (!f) return; setBusy(true); setErr(""); try { onChange(await shrink(f)); } catch (e) { setErr((e as Error).message); } setBusy(false); };
  const isData = (value || "").startsWith("data:");
  return (
    <div className="img">
      <div className={`imgbox ${value ? "" : "empty"}`}>{value ? <img src={value} alt="" /> : <span>Nenhuma imagem</span>}</div>
      <div className="imgact">
        <label className="btn2 pri">{busy ? "Enviando…" : value ? "Trocar imagem" : "Enviar imagem"}<input type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {value && <button type="button" className="btn2 dng" onClick={() => onChange("")}>Remover</button>}
        <button type="button" className="btn2 lnk" onClick={() => setUrl((u) => !u)}>{url ? "Fechar link" : "Usar link da internet"}</button>
      </div>
      {url && <input className="in" placeholder="Cole aqui o endereço da imagem (https://…)" value={isData ? "" : value || ""} onChange={(e) => onChange(e.target.value)} />}
      {err && <div className="ferr">{err}</div>}
    </div>
  );
}

const MAX_VIDEO = 50 * 1024 * 1024; // 50 MB

function VideoInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [busy, setBusy] = useState(false), [pct, setPct] = useState(0), [err, setErr] = useState("");
  const cb = useRef(onChange);
  cb.current = onChange; // sempre usa a versão mais nova (não perde o que você digitar durante o envio)
  const v = (value || "").trim();
  const kind = !v ? "" : /youtu\.?be|vimeo\.com/i.test(v) ? "link" : "file";

  const send = async (f?: File) => {
    if (!f) return;
    setErr("");
    const type = f.type || (/\.(mp4|m4v)$/i.test(f.name) ? "video/mp4" : /\.webm$/i.test(f.name) ? "video/webm" : /\.mov$/i.test(f.name) ? "video/quicktime" : "");
    if (!type.startsWith("video/")) { setErr("Escolha um arquivo de vídeo (mp4, mov ou webm)."); return; }
    if (f.size > MAX_VIDEO) { setErr("Esse vídeo passa de 50 MB. Suba no YouTube (como “não listado”) e cole o link aqui em cima."); return; }
    setBusy(true); setPct(0);
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, type, size: f.size }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não foi possível preparar o envio.");
      await new Promise<void>((ok, bad) => {
        const x = new XMLHttpRequest();
        x.open("PUT", j.uploadUrl);
        x.setRequestHeader("Content-Type", type);
        if (j.apikey) x.setRequestHeader("apikey", j.apikey);
        x.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
        x.onload = () => (x.status >= 200 && x.status < 300 ? ok() : bad(new Error(`O envio falhou (${x.status}). ${String(x.responseText).slice(0, 140)}`)));
        x.onerror = () => bad(new Error("A internet caiu durante o envio. Tente de novo."));
        x.send(f);
      });
      cb.current(j.publicUrl);
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };

  return (
    <div className="img">
      <input className="in" placeholder="Cole o link do YouTube aqui…" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <div className="imgact">
        <label className="btn2 pri">{busy ? `Enviando… ${pct}%` : "📤 Enviar vídeo do celular"}
          <input type="file" accept="video/*" hidden disabled={busy} onChange={(e) => { send(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {v && !busy && <button type="button" className="btn2 dng" onClick={() => onChange("")}>Remover vídeo</button>}
      </div>
      {busy && <div style={{ height: 8, borderRadius: 6, background: "#e5e7eb", overflow: "hidden", marginTop: 8 }}><div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", transition: "width .2s" }} /></div>}
      {!busy && kind === "link" && <div className="fh">✔ Link do YouTube/Vimeo reconhecido.</div>}
      {!busy && kind === "file" && <div className="fh">✔ Arquivo de vídeo pronto (o visitante assiste direto no site).</div>}
      {err && <div className="ferr">{err}</div>}
    </div>
  );
}

function LinkInput({ value, onChange, presets }: { value: string; onChange: (s: string) => void; presets?: [string, string][] }) {
  const ps = presets ?? [];
  const match = ps.find((p) => p[0] === (value ?? ""));
  const [forced, setForced] = useState(false);
  const custom = forced || !match;
  return (
    <div className="lnkbox">
      {ps.length > 0 && (
        <select className="in" value={custom ? "__c" : value} onChange={(e) => { if (e.target.value === "__c") { setForced(true); } else { setForced(false); onChange(e.target.value); } }}>
          {ps.map((p) => <option key={p[0]} value={p[0]}>{p[1]}</option>)}
          <option value="__c">Outro endereço (digitar)…</option>
        </select>
      )}
      {custom && <input className="in" placeholder="https://… ou #planos" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (b: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`sw ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <i /><span>{label}</span><em>{on ? "SIM" : "NÃO"}</em>
    </button>
  );
}
export { Toggle };

const move = <T,>(a: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= a.length) return a; const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };

function ImageGrid({ f, value, onChange }: { f: Extract<Field, { t: "list" }>; value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const addMany = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true); setErr("");
    const out: string[] = [];
    for (const file of Array.from(files)) { try { out.push(await shrink(file, 900)); } catch { setErr("Algum arquivo não era uma imagem e foi ignorado."); } }
    onChange([...value, ...out]); setBusy(false);
  };
  return (
    <div>
      <div className="igrid">
        {value.map((src, i) => (
          <div className="itile" key={i}>
            {src ? <img src={src} alt="" /> : <span>vazio</span>}
            <div className="tact"><button type="button" onClick={() => onChange(move(value, i, -1))} disabled={i === 0} title="Mover para trás">◀</button>
              <button type="button" onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} title="Mover para frente">▶</button>
              <button type="button" className="dng" onClick={() => onChange(value.filter((_, j) => j !== i))} title="Remover">✕</button></div>
            <b>{i + 1}</b>
          </div>
        ))}
        {!value.length && <div className="iempty">Nenhuma foto ainda.</div>}
      </div>
      <label className="btn2 pri big">{busy ? "Enviando fotos…" : `＋ ${f.add}${f.k === "results.images" ? "s (pode escolher várias)" : ""}`}
        <input type="file" accept="image/*" multiple hidden onChange={(e) => { addMany(e.target.files); e.target.value = ""; }} /></label>
      {err && <div className="ferr">{err}</div>}
    </div>
  );
}

function ListInput({ f, value, onChange }: { f: Extract<Field, { t: "list" }>; value: any[]; onChange: (v: any[]) => void }) {
  const arr = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const objs = Array.isArray(f.of);
  if (f.of === "image") return <ImageGrid f={f} value={arr as string[]} onChange={onChange} />;
  const isOpen = (i: number) => open[i] ?? arr.length <= 3;
  const title = (it: any, i: number) => {
    const v = f.titleKey ? getIn(it, f.titleKey) : undefined;
    return `${i + 1}. ${v ? String(v).slice(0, 48) : "(sem título)"}`;
  };
  const add = () => { const n = objs ? blankOf(f.of as Field[]) : ""; onChange([...arr, n]); if (objs) setOpen((o) => ({ ...o, [arr.length]: true })); };
  const dup = (i: number) => { const c = JSON.parse(JSON.stringify(arr[i])); if (c && typeof c === "object" && "id" in c) c.id = "n" + Date.now().toString(36); const a = [...arr]; a.splice(i + 1, 0, c); onChange(a); setOpen({}); };
  const del = (i: number) => { if (confirm("Remover este item? Você ainda poderá desfazer com o botão “Desfazer”.")) { onChange(arr.filter((_, j) => j !== i)); setOpen({}); } };
  const mv = (i: number, d: number) => { onChange(move(arr, i, d)); setOpen({}); };
  return (
    <div className="list">
      {arr.map((it, i) => (
        <div className="li" key={i}>
          {objs ? (<>
            <div className="lih" onClick={() => setOpen((o) => ({ ...o, [i]: !isOpen(i) }))}>
              <span className="lit"><i>{isOpen(i) ? "▾" : "▸"}</i>{title(it, i)}</span>
              <span className="lia" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => mv(i, -1)} disabled={i === 0} title="Subir">↑</button>
                <button type="button" onClick={() => mv(i, 1)} disabled={i === arr.length - 1} title="Descer">↓</button>
                {!f.noAdd && <button type="button" onClick={() => dup(i)} title="Duplicar">⧉</button>}
                {!f.noAdd && <button type="button" className="dng" onClick={() => del(i)} title="Remover">✕</button>}
              </span>
            </div>
            {isOpen(i) && <div className="lib"><Fields fields={f.of as Field[]} base={it} onBase={(nb) => onChange(arr.map((o, j) => (j === i ? nb : o)))} /></div>}
          </>) : (
            <div className="lrow">
              {f.of === "rich"
                ? <RichInput rows={2} value={it} onChange={(v) => onChange(arr.map((o, j) => (j === i ? v : o)))} />
                : <input className="in" placeholder={f.ph} value={it ?? ""} onChange={(e) => onChange(arr.map((o, j) => (j === i ? e.target.value : o)))} />}
              <span className="lia">
                <button type="button" onClick={() => mv(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" onClick={() => mv(i, 1)} disabled={i === arr.length - 1}>↓</button>
                <button type="button" className="dng" onClick={() => onChange(arr.filter((_, j) => j !== i))}>✕</button>
              </span>
            </div>
          )}
        </div>
      ))}
      {!arr.length && <div className="iempty">Nada por aqui ainda.</div>}
      {!f.noAdd && <button type="button" className="addbtn" onClick={add}>＋ {f.add}</button>}
    </div>
  );
}

export function Fields({ fields, base, onBase }: { fields: Field[]; base: any; onBase: (b: any) => void }) {
  return (
    <>
      {fields.map((f, n) => {
        if (f.t === "id") return null;
        if (f.t === "note") return <div key={n} className={`note ${f.tone ?? "info"}`}>{f.tone === "warn" ? "⚠️ " : "ℹ️ "}{f.text}</div>;
        if (f.t === "group") return (
          <fieldset key={n} className="grp"><legend>{f.label}</legend>{f.help && <div className="fh">{f.help}</div>}<Fields fields={f.fields} base={base} onBase={onBase} /></fieldset>
        );
        const v = getIn(base, f.k);
        const set = (x: any) => onBase(setIn(base, f.k, x));
        switch (f.t) {
          case "text": return <Box key={n} label={f.label} help={f.help}><input className="in" placeholder={f.ph} value={v ?? ""} onChange={(e) => set(e.target.value)} /></Box>;
          case "area": return <Box key={n} label={f.label} help={f.help}><textarea className="in" rows={f.rows ?? 3} value={v ?? ""} onChange={(e) => set(e.target.value)} /></Box>;
          case "rich": return <Box key={n} label={f.label} help={f.help}><RichInput rows={f.rows} value={v ?? ""} onChange={set} /></Box>;
          case "image": return <Box key={n} label={f.label} help={f.help}><ImageInput value={v ?? ""} onChange={set} /></Box>;
          case "video": return <Box key={n} label={f.label} help={f.help}><VideoInput value={v ?? ""} onChange={set} /></Box>;
          case "link": return <Box key={n} label={f.label} help={f.help}><LinkInput value={v ?? ""} onChange={set} presets={f.presets} /></Box>;
          case "color": return (
            <Box key={n} label={f.label} help={f.help}>
              <div className="col"><input type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#000000"} onChange={(e) => set(e.target.value)} />
                <input className="in hex" value={v ?? ""} onChange={(e) => set(e.target.value)} maxLength={9} /></div>
            </Box>);
          case "num": return <Box key={n} label={f.label} help={f.help}><Num value={Number(v ?? 0)} onChange={set} step={f.step} prefix={f.prefix} suffix={f.suffix} /></Box>;
          case "bool": return <Box key={n} label="" help={f.help}><Toggle on={!!v} onChange={set} label={f.label} /></Box>;
          case "select": return <Box key={n} label={f.label} help={f.help}><select className="in" value={v ?? ""} onChange={(e) => set(e.target.value)}>{f.opts.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select></Box>;
          case "list": return <Box key={n} label={f.label} help={f.help} wide><ListInput f={f} value={v} onChange={set} /></Box>;
        }
        return null;
      })}
    </>
  );
}