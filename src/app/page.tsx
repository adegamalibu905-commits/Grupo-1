import type { ReactNode } from "react";
import { getContent } from "@/lib/content";
import Plans from "@/components/Plans";
import Reveal from "@/components/Reveal";
import Motion from "@/components/Motion";
import CountUp from "@/components/CountUp";
import VideoBox from "@/components/VideoBox";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Rich from "@/components/Rich";
import Carousel from "@/components/Carousel";
import "@/components/sections.css";
import "@/components/newsections.css";

export const dynamic = "force-dynamic";
const st = (i: number) => ({ "--i": i } as React.CSSProperties);
const Check = () => (
  <svg viewBox="0 0 32 32" aria-hidden><path d="M3 17.5l8.2 8.2L29 6.5" fill="none" stroke="#ffd400" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default async function Home() {
  const c = await getContent();
  const s = c.settings;
  const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(s.whatsappText)}`;
  const Proof = ({ badges }: { badges: string[] }) => (
    <>
      <div className="badges">{badges.map((b, i) => <span key={i}>{b}</span>)}</div>
      <div className="center"><div className="stars">★★★★★</div><p className="muted">{s.proof}</p></div>
    </>
  );

  const R: Record<string, () => ReactNode> = {
    hero: () => (
      <section className="sec center hero"><div className="wrap">
        <Reveal>
          <p className="over st" style={st(0)}>{c.hero.overline}</p>
          <h1 className="h1 st" style={st(1)}>{c.hero.titleStart} <span className="shine-t">{c.hero.titleGold}</span></h1>
          <div className="rule" />
          <p className="st narrow" style={{ ...st(2), fontSize: 18 }}>{c.hero.subtitle}</p>
          <p className="muted st narrow" style={{ ...st(3), marginTop: 12 }}>{c.hero.support}</p>
          {c.hero.image && <img className="heroimg par st" style={st(3)} src={c.hero.image} alt="" />}
          <div className="stats">{c.hero.stats.map((x, i) => <div className="stat st" style={st(4 + i)} key={i}><CountUp text={x.n} /><span>{x.l}</span></div>)}</div>
        </Reveal>
      </div></section>
    ),
    video: () => (
      <Reveal><section className="sec center" style={{ paddingTop: 0 }}><div className="wrap">
        <h2 className="h2">{c.video.title}</h2>
        <p className="muted">{c.video.subtitle}</p>
        <VideoBox url={c.video.url} poster={c.video.poster} />
        <div className="stack">{c.video.buttons.map((b, i) => <a key={i} className="btn btn-gold st" style={st(i)} href={b.link}>{b.text}</a>)}</div>
        <p className="muted" style={{ marginTop: 14 }}>{c.video.note}</p>
        <Proof badges={c.video.badges} />
      </div></section></Reveal>
    ),
    plans: () => (
      <section className="sec center plansec" id="planos"><div className="wrap">
        <Reveal>
          <p className="over">{c.plans.overline}</p>
          <h2 className="h2">{c.plans.titleStart} <span className="gold">{c.plans.titleAccent}</span> {c.plans.titleEnd}</h2>
          <p className="muted narrow">{c.plans.text}</p>
        </Reveal>
        <Plans data={c.plans} career={c.career} />
      </div></section>
    ),
    renew: () => (
      <Reveal><section className="sec center"><div className="wrap"><div className="narrow">
        <p className="over">{c.renew.overline}</p>
        <h2 className="h2">{c.renew.title} <span className="gold">{c.renew.titleGold}</span></h2>
        <a className="btn btn-gold" style={{ marginTop: 18 }} href={c.renew.link || wa} target="_blank" rel="noopener noreferrer">{c.renew.button}</a>
        <p className="muted" style={{ marginTop: 10 }}>{c.renew.note}</p>
      </div></div></section></Reveal>
    ),
    what: () => (
      <Reveal><section className="sec center whatsec"><div className="wrap">
        <h2 className="h2">{c.what.title}</h2>
        <div className="wrule" />
        {c.what.intro && <p className="wintro"><Rich text={c.what.intro} /></p>}
        {c.what.highlight && <p className="whigh">{c.what.highlight}</p>}
        <div className="wcards">{c.what.items.map((w, i) => (
          <div className="wcard st" style={st(i)} key={i}>
            <div className="wav" aria-hidden>{w.image ? <img src={w.image} alt="" /> : w.icon}</div>
            <h3>{w.t}</h3><p><Rich text={w.d} /></p>
          </div>
        ))}</div>
      </div></section></Reveal>
    ),
    redacao: () => (
      <Reveal><section className="ns ns-black ns-red"><div className="ns-in ns-center">
        <h2 className="ns-h">{c.redacao.title}</h2>
        <p><Rich text={c.redacao.intro} /></p>
        <div className="ns-lines">{c.redacao.lines.map((l, i) => <p key={i}><Rich text={l} /></p>)}</div>
        <p><Rich text={c.redacao.note} /></p>
      </div></section></Reveal>
    ),
    forwho: () => (
      <Reveal><section className="ns ns-brown"><div className="ns-in">
        <h2 className="ns-h">{c.forwho.title}</h2>
        <div className="ns-brule" />
        <ul className="ns-ticks">{c.forwho.list.map((x, i) => <li key={i}><Check /><span><Rich text={x} /></span></li>)}</ul>
        {c.forwho.image1 && <div className="ns-photo"><img src={c.forwho.image1} alt="" /></div>}
        <div className="ns-qcard"><h3>{c.forwho.quote1Title}</h3><p><Rich text={c.forwho.quote1Text} /></p></div>
        <a className="btn btn-gold ns-cta" href={c.forwho.link}><span>{c.forwho.button}</span><i>→</i></a>
        {c.forwho.image2 && <div className="ns-photo"><img src={c.forwho.image2} alt="" /></div>}
        <div className="ns-qcard"><h3>{c.forwho.quote2Title}</h3><p><Rich text={c.forwho.quote2Text} /></p></div>
      </div></section></Reveal>
    ),
    receive: () => (
      <Reveal><section className="ns ns-light"><div className="ns-in">
        <div className="ns-box"><h2 className="ns-h">{c.receive.title}</h2></div>
        {c.receive.paragraphs.map((t, i) => <p key={i}><Rich text={t} /></p>)}
        <div className="ns-box" style={{ marginTop: 34 }}><h2 className="ns-h" style={{ fontSize: "clamp(22px,5.6vw,30px)" }}>{c.receive.proofTitle}</h2></div>
        {(c.receive.videoUrl || c.receive.poster) && <VideoBox url={c.receive.videoUrl} poster={c.receive.poster} />}
      </div></section></Reveal>
    ),
    results: () => {
      const n = Math.max(24, Math.ceil(c.results.images.length / 4) * 4);
      return (
        <section className="gallery">
          {(c.results.title || c.results.subtitle) && (
            <div className="gallery-head">
              {c.results.title && <h2 className="h2">{c.results.title}</h2>}
              {c.results.subtitle && <p className="muted">{c.results.subtitle}</p>}
            </div>
          )}
          <div className="gal">{Array.from({ length: n }, (_, i) => <div key={i}>{c.results.images[i] && <img loading="lazy" src={c.results.images[i]} alt="Aluno aprovado" />}</div>)}</div>
        </section>
      );
    },
    testimonials: () => (
      <Reveal><section className="sec"><div className="wrap">
        <h2 className="h2 center">{c.testimonials.title}</h2>
        <div className="cards" style={{ marginTop: 28 }}>{c.testimonials.items.map((t, i) => (
          <div className="card st" style={st(i)} key={i}>
            <div className="av">{t.image ? <img src={t.image} alt={t.name} /> : "👤"}</div>
            <h3>{t.name}</h3><p className="muted" style={{ color: "var(--gold-l)" }}>{t.role}</p>
            <p className="quote">“{t.text}”</p>
          </div>
        ))}</div>
      </div></section></Reveal>
    ),
    mentor: () => (
      <Reveal><section className="sec brown"><div className="wrap"><div className="mentor">
        <div className="ph st">{c.mentor.image ? <img src={c.mentor.image} alt={c.mentor.title} /> : s.logo && <img src={s.logo} alt="" style={{ objectFit: "contain" }} />}</div>
        <div>
          <p className="over">{c.mentor.overline}</p>
          <h2 className="h2">{c.mentor.title}</h2>
          <p className="muted" style={{ marginBottom: 14 }}>{c.mentor.text}</p>
          <ul className="tick" style={{ margin: 0 }}>{c.mentor.bullets.map((b, i) => <li className="st" style={st(i)} key={i}>{b}</li>)}</ul>
        </div>
      </div></div></section></Reveal>
    ),
    summary: () => (
      <Reveal><section className="ns ns-light" style={{ paddingTop: 0 }}><div className="ns-in">
        <div className="ns-sum">
          <h2 className="ns-h">{c.summary.title}</h2>
          <p><Rich text={c.summary.text} /></p>
          <p><b>{c.summary.guaranteeTitle}</b>{c.summary.guarantee}</p>
          {c.summary.sticker && <img className="ns-img ns-sticker" src={c.summary.sticker} alt="" />}
          <a className="btn btn-gold ns-cta" href={c.summary.link}><span>{c.summary.button}</span><i>→</i></a>
          {c.summary.payImage
            ? <img className="ns-payimg" src={c.summary.payImage} alt="" />
            : <div className="ns-pay">{c.summary.payItems.map((x, i) => <span key={i}>{x}</span>)}</div>}
          <div className="ns-rowproof">
            {c.summary.avatars.some(Boolean) && <div className="ns-av">{c.summary.avatars.filter(Boolean).map((a, i) => <img key={i} src={a} alt="" />)}</div>}
            <div><div className="ns-stars">★★★★★</div><p className="ns-proof">{s.proof}</p></div>
          </div>
        </div>
      </div></section></Reveal>
    ),
    basico: () => (
      <Reveal><section className="ns ns-black ns-basic"><div className="ns-in">
        <h2 className="ns-h">{c.basico.title}</h2>
        <ul className="ns-ticks">{c.basico.items.map((x, i) => <li key={i}><Check /><span><Rich text={x} /></span></li>)}</ul>
      </div></section></Reveal>
    ),
    caution: () => (
      <Reveal><section className="ns ns-caution"><div className="ns-in">
        <h2 className="ns-h">{c.caution.title}<br />{c.caution.title2}</h2>
        <Carousel items={c.caution.items} />
      </div></section></Reveal>
    ),
    placa: () => (
      <Reveal><section className="ns ns-placa"><div className="ns-in">
        <h2 className="ns-h">{c.placa.title}</h2>
        {c.placa.paragraphs.map((t, i) => <p key={i}><Rich text={t} /></p>)}
      </div>
        {c.placa.videoUrl
          ? <VideoBox url={c.placa.videoUrl} poster={c.placa.image} />
          : c.placa.image && <img className="ns-pimg" src={c.placa.image} alt="" />}
      </section></Reveal>
    ),
    origin: () => (
      <>
        <div aria-hidden style={{ height: Math.max(0, Number(c.origin.spacer) || 0), background: "#000" }} />
        <Reveal><section className="ns ns-origin"><div className="ns-in">
          <h2 className="ns-h">{c.origin.title} <span>{c.origin.titleGold}</span></h2>
          {c.origin.paragraphs.map((t, i) => <p key={i}><Rich text={t} /></p>)}
        </div>
          {c.origin.image && <div className="ns-orimg"><img src={c.origin.image} alt="" /></div>}
        </section></Reveal>
      </>
    ),
    benefits: () => (
      <Reveal><section className="sec center"><div className="wrap">
        <h2 className="h2">{c.benefits.title}</h2>
        <ol className="num" style={{ textAlign: "left" }}>{c.benefits.items.map((b, i) => <li className="st" style={st(i)} key={i}>{b}</li>)}</ol>
        <div className="stack" style={{ marginTop: 22 }}><a className="btn btn-yellow" href={c.benefits.link}>{c.benefits.button}</a></div>
        <Proof badges={c.video.badges} />
      </div></section></Reveal>
    ),
    banner: () => <div className="band center"><h2 className="h2" style={{ margin: 0 }}>{c.banner.text}</h2></div>,
    faq: () => (
      <Reveal><section className="sec"><div className="wrap">
        <h2 className="h2 center" style={{ marginBottom: 24 }}>{c.faq.title}</h2>
        {c.faq.items.map((f, i) => <details className="st" style={st(i)} key={i}><summary>{f.q}</summary><p className="muted">{f.a}</p></details>)}
        <div className="stack" style={{ marginTop: 22 }}><a className="btn btn-yellow" href={c.faq.link}>{c.faq.button}</a></div>
      </div></section></Reveal>
    ),
    final: () => (
      <Reveal><section className="sec center cta-final"><div className="wrap"><div className="narrow">
        <h2 className="h2">{c.final.title}</h2>
        <p className="muted" style={{ marginBottom: 22 }}>{c.final.text}</p>
        <a className="btn btn-gold" href={c.final.link}>{c.final.button}</a>
      </div></div></section></Reveal>
    ),
  };

  return (
    <main>
      <Motion />
      {c.sections.filter((x) => x.on && R[x.id]).map((x) => <div key={x.id}>{R[x.id]()}</div>)}
      <footer className="ns-foot">
        <p>Copyright © {new Date().getFullYear()} {s.footerOwner}. {s.footerText}</p>
        {s.footerSub && <p>{s.footerSub}</p>}
      </footer>
      <WhatsAppWidget phone={s.whatsapp} text={s.whatsappText} label={s.waLabel} title={s.waTitle} body={s.waText} cta={s.waCta} />
    </main>
  );
}