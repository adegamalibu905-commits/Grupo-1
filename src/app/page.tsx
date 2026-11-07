import { SITE, STATS, RECEIVES, WHAT_IS, FOR_WHO, NOT_FOR_WHO, BENEFITS, FAQ } from "@/config/site";
import Plans from "@/components/Plans";
import Reveal from "@/components/Reveal";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function Home() {
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(SITE.whatsappText)}`;
  const Badges = () => (
    <>
      <div className="badges"><span>Pix</span><span>Compra 100% segura</span><span>Privacidade protegida</span></div>
      <div className="center"><div className="stars">★★★★★</div><p className="muted">{SITE.proof}</p></div>
    </>
  );
  return (
    <main>
      <section className="sec center"><div className="wrap">
        <p className="over">{SITE.overline}</p>
        <h1 className="h1">{SITE.titleStart} <span className="gold">{SITE.titleGold}</span></h1>
        <div className="rule" />
        <p style={{ fontSize: 17 }}>{SITE.subtitle}</p>
        <p className="muted" style={{ marginTop: 12 }}>{SITE.support}</p>
        <div className="stats">{STATS.map((s) => <div className="stat" key={s.l}><b>{s.n}</b><span>{s.l}</span></div>)}</div>
      </div></section>

      <Reveal><section className="sec center" style={{ paddingTop: 0 }}><div className="wrap">
        <h2 className="h2">VEJA A MENTORIA POR DENTRO</h2>
        <div className="video"><div className="play" aria-hidden>▶</div></div>
        <div className="stack">
          <a className="btn btn-gold" href="#planos">QUERO SER SOLDADO →</a>
          <a className="btn btn-gold" href="#planos">QUERO SER CADETE →</a>
        </div>
        <p className="muted" style={{ marginTop: 14 }}>Soldado • Cadete • Turmas 2026/2027</p>
        <Badges />
      </div></section></Reveal>

      <Reveal><section className="sec center" id="planos"><div className="wrap">
        <p className="over">MATRÍCULAS ABERTAS</p>
        <h2 className="h2">Escolha sua <span className="gold">carreira</span> e o tempo de acesso</h2>
        <p className="muted">Você recebe o mesmo conteúdo completo em qualquer plano. Escolha a carreira e por quanto tempo deseja ter acesso à preparação.</p>
        <div style={{ textAlign: "left" }}><Plans /></div>
        <p className="over" style={{ marginTop: 32 }}>TUDO O QUE VOCÊ RECEBE</p>
        <div className="chips">{RECEIVES.map((r) => <span className="chip" key={r}>{r}</span>)}</div>
        <p className="muted" style={{ marginTop: 18, fontSize: 12 }}>Pix • Pagamento seguro • {SITE.guarantee} • Sem renovação automática</p>
      </div></section></Reveal>

      <Reveal><section className="sec center"><div className="wrap">
        <p className="over">CONDIÇÃO EXCLUSIVA PARA EX-ALUNOS</p>
        <h2 className="h2">JÁ FOI ALUNO? RENOVE COM <span className="gold">DESCONTO.</span></h2>
        <a className="btn btn-gold" style={{ marginTop: 18 }} href={wa} target="_blank" rel="noopener noreferrer">RENOVAR COM DESCONTO</a>
        <p className="muted" style={{ marginTop: 10 }}>Atendimento pelo WhatsApp</p>
      </div></section></Reveal>

      <Reveal><section className="sec"><div className="wrap">
        <h2 className="h2 center">O que é a Mentoria?</h2>
        <div className="cards">{WHAT_IS.map((w) => (
          <div className="card" key={w.t}><div className="av" aria-hidden>★</div><h3>{w.t}</h3><p className="muted">{w.d}</p></div>
        ))}</div>
      </div></section></Reveal>

      <Reveal><section className="sec brown"><div className="wrap">
        <h2 className="h2 center">Para <span className="gold">QUEM</span> é a Mentoria?</h2>
        <ul className="tick">{FOR_WHO.map((x) => <li key={x}>{x}</li>)}</ul>
      </div></section></Reveal>

      <Reveal><section className="sec white"><div className="wrap">
        <h2 className="h2 center">Resumindo</h2>
        <p className="muted">Você recebe tudo o que precisa para estudar com método, sem precisar adquirir mais materiais.</p>
        <p style={{ marginTop: 14 }}><b>Garantia de 07 dias:</b> em observância ao art. 49 do Código de Defesa do Consumidor, você pode desistir em até 7 dias após a contratação.</p>
        <ul className="tick nolist" style={{ marginTop: 22 }}>{NOT_FOR_WHO.map((x) => <li key={x}>{x}</li>)}</ul>
      </div></section></Reveal>

      <Reveal><section className="sec"><div className="wrap">
        <h2 className="h2 center">Por que vale a pena a carreira?</h2>
        <ol className="num">{BENEFITS.map((b) => <li key={b}>{b}</li>)}</ol>
        <a className="btn btn-yellow" style={{ marginTop: 18 }} href="#planos">QUERO COMPRAR A MENTORIA</a>
        <Badges />
      </div></section></Reveal>

      <div className="navy center"><h2 className="h2" style={{ margin: 0 }}>Colecionando Primeiros Colocados</h2></div>

      <Reveal><section className="sec"><div className="wrap">
        <h2 className="h2 center">Perguntas frequentes</h2>
        {FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p className="muted">{f.a}</p></details>)}
        <a className="btn btn-yellow" style={{ marginTop: 18 }} href="#planos">Comprar Agora</a>
      </div></section></Reveal>

      <footer className="foot"><div className="wrap">
        <p>© {new Date().getFullYear()} {SITE.brand}. Todos os direitos reservados.</p>
        <p style={{ marginTop: 6 }}>Pagamentos processados por Pix.</p>
      </div></footer>
      <WhatsAppWidget />
    </main>
  );
}