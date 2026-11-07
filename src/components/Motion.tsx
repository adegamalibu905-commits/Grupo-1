"use client";
import { useEffect } from "react";

export default function Motion() {
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - innerHeight, s = document.documentElement.style;
        s.setProperty("--sy", String(Math.min(scrollY, 1400)));
        s.setProperty("--prog", String(h > 0 ? scrollY / h : 0));
      });
    };
    upd();
    addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", upd); removeEventListener("resize", upd); };
  }, []);
  return <div className="prog" aria-hidden />;
}