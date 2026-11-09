import type { Content } from "@/config/site";

export default function ThanksView({ c }: { c: Content }) {
  const t = c.thanks;
  return (
    <main className="sec center"><div className="wrap">
      <h1 className="h1">{t.title}</h1>
      <div className="rule" />
      <p>{t.text}</p>
      <a className="btn btn-gold" style={{ marginTop: 24 }} href={t.link || "/"}>{t.button}</a>
    </div></main>
  );
}