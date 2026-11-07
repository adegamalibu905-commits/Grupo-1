"use client";
import { useEffect, useRef, useState } from "react";

export function useTween(target: number, ms = 700) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      cur.current = from + (target - from) * e; setV(cur.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export default function CountUp({ text }: { text: string }) {
  const ref = useRef<HTMLElement>(null);
  const num = /^[\d.]+$/.test(text) ? Number(text.replace(/\./g, "")) : NaN;
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || isNaN(num)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [num]);
  const v = useTween(go ? num : 0, 1600);
  return <b ref={ref}>{isNaN(num) ? text : Math.round(go ? v : num).toLocaleString("pt-BR")}</b>;
}