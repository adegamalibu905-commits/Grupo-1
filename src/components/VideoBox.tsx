"use client";
import { useState } from "react";

function embed(u: string) {
  const y = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (y) return { kind: "iframe", src: `https://www.youtube.com/embed/${y[1]}?autoplay=1&rel=0` };
  const v = u.match(/vimeo\.com\/(\d+)/);
  if (v) return { kind: "iframe", src: `https://player.vimeo.com/video/${v[1]}?autoplay=1` };
  return { kind: "video", src: u };
}

export default function VideoBox({ url, poster }: { url: string; poster: string }) {
  const [on, setOn] = useState(false);
  const e = url ? embed(url) : null;
  return (
    <div className="video" style={poster ? { backgroundImage: `url(${poster})` } : undefined} onClick={() => e && setOn(true)}>
      {on && e ? (e.kind === "iframe"
        ? <iframe src={e.src} allow="autoplay; fullscreen; encrypted-media" allowFullScreen title="Vídeo" />
        : <video src={e.src} controls autoPlay playsInline />)
        : <div className="play" aria-hidden>▶</div>}
    </div>
  );
}