import type { ReactNode } from "react";
import type { Content } from "@/config/site";
import { autoPricing } from "@/lib/coupons";
import Rich from "./Rich";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import Motion from "./Motion";
import Carousel from "./Carousel";
import VideoBox from "./VideoBox";
import Plans from "./Plans";
import WhatsAppWidget from "./WhatsAppWidget";
import "./sections.css";
import "./newsections.css";

function Tick() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="none" stroke="#c8a86a" strokeWidth="1.6" />
      <path d="M9.5 16.5l4.4 4.4 8.6-9.4" fill="none" stroke="#e2cb97" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sec({ id, label, className = "", children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return (
    <section id={`sec-${id}`} data-sec={id} data-label={label} className={className}>
      {children}
    </section>
  );
}

export default function SiteView({ c }: { c: Content }) {
  const s = c.settings;
  const waHref = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(s.whatsappText)}`;
  const year = new Date().getFullYear();

  const render: Record<string, (label: string) => ReactNode> = {
    hero: (label) => (
      <Sec id="hero" label={label} className="sec hero center">
        <div className="wrap par">
          <p className="over">{c.hero.overline}</p>
          <h1 className="h1">
            {c.hero.titleStart} <span className="shine-t">{c.hero.titleGold}</span>
          </h1>
          <div className="rule" />
          <p className="muted narrow">{c.hero.subtitle}</p>
          {c.hero.support && <p className="muted narrow" style={{ marginTop: 12 }}>{c.hero.support}</p>}
          {c.hero.image && <img className="heroimg" src={c.hero.image} alt="" />}
          <div className="stats">
            {c.hero.stats.map((st, i) => (
              <div className="stat" key={i}>
                <CountUp text={st.n} />
                <span>{st.l}</span>
              </div>
            ))}
          </div>
          {s.guarantee && <p className="muted" style={{ marginTop: 20 }}>{s.guarantee}</p>}
        </div>
      </Sec>
    ),

    video: (label) => (
      <Sec id="video" label={label} className="sec center">
        <div className="wrap">
          <h2 className="h2">{c.video.title}</h2>
          <p className="muted narrow">{c.video.subtitle}</p>
          <VideoBox url={c.video.url} poster={c.video.poster} />
          <div className="stack">
            {c.video.buttons.map((b, i) => (
              <a key={i} className={`btn ${i === 0 ? "btn-gold" : "btn-ghost"}`} href={b.link || "#planos"}>{b.text}</a>
            ))}
          </div>
          {c.video.note && <p className="muted" style={{ marginTop: 18 }}>{c.video.note}</p>}
          <div className="badges">
            {c.video.badges.map((b, i) => <span key={i}>{b}</span>)}
          </div>
          <div className="stars" aria-hidden>★★★★★</div>
          {s.proof && <p className="muted" style={{ marginTop: 6 }}>{s.proof}</p>}
        </div>
      </Sec>
    ),

    plans: (label) => (
      <Sec id="plans" label={label} className="sec plansec center">
        <div className="wrap" id="planos">
          <p className="over">{c.plans.overline}</p>
          <h2 className="h2">
            {c.plans.titleStart} <span className="gold">{c.plans.titleAccent}</span> {c.plans.titleEnd}
          </h2>
          <p className="muted narrow">{c.plans.text}</p>
          <Plans data={c.plans} career={c.career} auto={autoPricing(c.coupons)} checkout={c.checkout} />
        </div>
      </Sec>
    ),

    renew: (label) => (
      <Sec id="renew" label={label} className="sec center">
        <div className="wrap">
          <p className="over">{c.renew.overline}</p>
          <h2 className="h2">
            {c.renew.title} <span className="gold">{c.renew.titleGold}</span>
          </h2>
          <div className="stack" style={{ marginTop: 18 }}>
            <a className="btn btn-yellow" href={c.renew.link || waHref} target={c.renew.link ? undefined : "_blank"} rel="noopener noreferrer">{c.renew.button}</a>
          </div>
          {c.renew.note && <p className="muted" style={{ marginTop: 14 }}>{c.renew.note}</p>}
        </div>
      </Sec>
    ),

    results: (label) =>
      c.results.images.length || c.results.title ? (
        <Sec id="results" label={label} className="gallery">
          {(c.results.title || c.results.subtitle) && (
            <div className="gallery-head">
              {c.results.title && <h2 className="h2">{c.results.title}</h2>}
              {c.results.subtitle && <p className="muted">{c.results.subtitle}</p>}
            </div>
          )}
          <div className="gal">
            {c.results.images.map((src, i) => (
              <div key={i}>{src ? <img src={src} alt="" loading="lazy" /> : null}</div>
            ))}
          </div>
        </Sec>
      ) : null,

    what: (label) => (
      <Sec id="what" label={label} className="sec whatsec center">
        <Reveal>
          <div className="wrap">
            <h2 className="h2">{c.what.title}</h2>
            <div className="wrule" />
            <p className="wintro"><Rich text={c.what.intro} /></p>
            <p className="whigh">{c.what.highlight}</p>
            <div className="wcards">
              {c.what.items.map((it, i) => (
                <div className="wcard st" style={{ "--i": i } as React.CSSProperties} key={i}>
                  <div className="wav">{it.image ? <img src={it.image} alt="" /> : it.icon}</div>
                  <h3>{it.t}</h3>
                  <p><Rich text={it.d} /></p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Sec>
    ),

    redacao: (label) => (
      <Sec id="redacao" label={label} className="ns ns-black ns-red">
        <div className="ns-in">
          <h2 className="ns-h">{c.redacao.title}</h2>
          <p><Rich text={c.redacao.intro} /></p>
          <div className="ns-lines">
            {c.redacao.lines.map((l, i) => <p key={i}><Rich text={l} /></p>)}
          </div>
          <p><Rich text={c.redacao.note} /></p>
        </div>
      </Sec>
    ),

    forwho: (label) => (
      <Sec id="forwho" label={label} className="ns ns-brown">
        <div className="ns-in">
          <h2 className="ns-h">{c.forwho.title}</h2>
          <div className="ns-brule" />
          <ul className="ns-ticks">
            {c.forwho.list.map((t, i) => (
              <li key={i}><Tick /><span><Rich text={t} /></span></li>
            ))}
          </ul>
          {c.forwho.image1 && <div className="ns-photo"><img src={c.forwho.image1} alt="" /></div>}
          <div className="ns-qcard">
            <h3>{c.forwho.quote1Title}</h3>
            <p><Rich text={c.forwho.quote1Text} /></p>
          </div>
          <a className="btn btn-yellow ns-cta" href={c.forwho.link || "#planos"}>{c.forwho.button}<i>→</i></a>
          {c.forwho.image2 && <div className="ns-photo"><img src={c.forwho.image2} alt="" /></div>}
          <div className="ns-qcard">
            <h3>{c.forwho.quote2Title}</h3>
            <p><Rich text={c.forwho.quote2Text} /></p>
          </div>
        </div>
      </Sec>
    ),

    receive: (label) => (
      <Sec id="receive" label={label} className="ns ns-light">
        <div className="ns-in">
          <div className="ns-box">
            <h2 className="ns-h" style={{ marginBottom: 18 }}>{c.receive.title}</h2>
            {c.receive.paragraphs.map((p, i) => <p key={i}><Rich text={p} /></p>)}
          </div>
          {(c.receive.videoUrl || c.receive.poster) && (
            <>
              <p><b>{c.receive.proofTitle}</b></p>
              <VideoBox url={c.receive.videoUrl} poster={c.receive.poster} />
            </>
          )}
        </div>
      </Sec>
    ),

    summary: (label) => (
      <Sec id="summary" label={label} className="ns ns-light">
        <div className="ns-in">
          <div className="ns-sum">
            <h2 className="ns-h">{c.summary.title}</h2>
            <p><Rich text={c.summary.text} /></p>
            <p><b>{c.summary.guaranteeTitle}</b>{c.summary.guarantee}</p>
            {c.summary.sticker && <img className="ns-sticker ns-img" src={c.summary.sticker} alt="" />}
            <a className="btn btn-yellow ns-cta" href={c.summary.link || "#planos"}>{c.summary.button}<i>→</i></a>
            {c.summary.payImage
              ? <img className="ns-payimg" src={c.summary.payImage} alt="" />
              : <div className="ns-pay">{c.summary.payItems.map((x, i) => <span key={i}>{x}</span>)}</div>}
            <div className="ns-rowproof">
              {c.summary.avatars.length > 0 && (
                <div className="ns-av">{c.summary.avatars.map((a, i) => <img key={i} src={a} alt="" />)}</div>
              )}
              <div>
                <div className="ns-stars" aria-hidden>★★★★★</div>
                <p className="ns-proof">{s.proof}</p>
              </div>
            </div>
          </div>
        </div>
      </Sec>
    ),

    basico: (label) => (
      <Sec id="basico" label={label} className="ns ns-black ns-basic">
        <div className="ns-in">
          <h2 className="ns-h">{c.basico.title}</h2>
          <ul className="ns-ticks">
            {c.basico.items.map((t, i) => (
              <li key={i}><Tick /><span><Rich text={t} /></span></li>
            ))}
          </ul>
        </div>
      </Sec>
    ),

    testimonials: (label) => (
      <Sec id="testimonials" label={label} className="sec center">
        <Reveal>
          <div className="wrap">
            <h2 className="h2">{c.testimonials.title}</h2>
            <div className="stars" aria-hidden style={{ marginBottom: 22 }}>★★★★★</div>
            <div className="cards">
              {c.testimonials.items.map((t, i) => (
                <div className="card st" style={{ "--i": i } as React.CSSProperties} key={i}>
                  <div className="av">{t.image ? <img src={t.image} alt={t.name} /> : "👤"}</div>
                  <h3>{t.name}</h3>
                  <p className="muted">{t.role}</p>
                  <p className="quote">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Sec>
    ),

    caution: (label) => (
      <Sec id="caution" label={label} className="ns ns-caution">
        <div className="ns-in">
          <h2 className="ns-h">{c.caution.title}<br />{c.caution.title2}</h2>
          <Carousel items={c.caution.items} />
        </div>
      </Sec>
    ),

    placa: (label) => (
      <Sec id="placa" label={label} className="ns ns-placa">
        <div className="ns-in">
          <h2 className="ns-h">{c.placa.title}</h2>
          {c.placa.paragraphs.map((p, i) => <p key={i}><Rich text={p} /></p>)}
        </div>
        {c.placa.image && <img className="ns-pimg" src={c.placa.image} alt="" />}
        {c.placa.videoUrl && <VideoBox url={c.placa.videoUrl} poster="" />}
      </Sec>
    ),

    origin: (label) => (
      <>
        <div style={{ height: Math.max(0, Number(c.origin.spacer) || 0), background: "#000" }} aria-hidden />
        <Sec id="origin" label={label} className="ns ns-origin">
          <div className="ns-in">
            <h2 className="ns-h">{c.origin.title} <span>{c.origin.titleGold}</span></h2>
            {c.origin.paragraphs.map((p, i) => <p key={i}><Rich text={p} /></p>)}
          </div>
          {c.origin.image && <div className="ns-orimg"><img src={c.origin.image} alt="" /></div>}
        </Sec>
      </>
    ),

    mentor: (label) => (
      <Sec id="mentor" label={label} className="sec">
        <div className="wrap">
          <div className="mentor">
            <div className="ph">{c.mentor.image ? <img src={c.mentor.image} alt={c.mentor.title} /> : null}</div>
            <div>
              <p className="over">{c.mentor.overline}</p>
              <h2 className="h2">{c.mentor.title}</h2>
              <p className="muted">{c.mentor.text}</p>
              <ul className="tick">{c.mentor.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          </div>
        </div>
      </Sec>
    ),

    benefits: (label) => (
      <Sec id="benefits" label={label} className="sec center">
        <div className="wrap">
          <h2 className="h2">{c.benefits.title}</h2>
          <ul className="tick" style={{ textAlign: "left" }}>{c.benefits.items.map((b, i) => <li key={i}>{b}</li>)}</ul>
          <div className="stack" style={{ marginTop: 26 }}>
            <a className="btn btn-gold" href={c.benefits.link || "#planos"}>{c.benefits.button}</a>
          </div>
        </div>
      </Sec>
    ),

    banner: (label) => (
      <Sec id="banner" label={label} className="band center">
        <div className="wrap"><h2 className="h2" style={{ marginBottom: 0 }}>{c.banner.text}</h2></div>
      </Sec>
    ),

    faq: (label) => (
      <Sec id="faq" label={label} className="sec">
        <div className="wrap">
          <h2 className="h2 center" style={{ textAlign: "center", marginBottom: 24 }}>{c.faq.title}</h2>
          {c.faq.items.map((q, i) => (
            <details key={i}>
              <summary>{q.q}</summary>
              <p className="muted">{q.a}</p>
            </details>
          ))}
          <div className="stack" style={{ marginTop: 24 }}>
            <a className="btn btn-gold" href={c.faq.link || "#planos"}>{c.faq.button}</a>
          </div>
        </div>
      </Sec>
    ),

    final: (label) => (
      <Sec id="final" label={label} className="sec cta-final center">
        <div className="wrap">
          <h2 className="h2">{c.final.title}</h2>
          <p className="muted narrow">{c.final.text}</p>
          <div className="stack" style={{ marginTop: 22 }}>
            <a className="btn btn-gold" href={c.final.link || "#planos"}>{c.final.button}</a>
          </div>
        </div>
      </Sec>
    ),
  };

  return (
    <>
      <Motion />
      <main>
        {c.sections.filter((x) => x.on).map((x) => {
          const fn = render[x.id];
          return fn ? <div key={x.id}>{fn(x.label)}</div> : null;
        })}
      </main>
      <footer id="sec-rodape" data-sec="rodape" data-label="Rodapé" className="ns-foot">
        <p>Copyright © {year} {s.footerOwner}. {s.footerText}</p>
        {s.footerSub && <p>{s.footerSub}</p>}
      </footer>
      <div id="sec-wa" data-sec="wa" data-label="WhatsApp">
        <WhatsAppWidget phone={s.whatsapp} text={s.whatsappText} label={s.waLabel} title={s.waTitle} body={s.waText} cta={s.waCta} />
      </div>
    </>
  );
} 