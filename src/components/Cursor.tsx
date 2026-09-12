"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Cursor.module.css";

const LABELS: Record<string, string> = {
  view: "View",
  explore: "Explore",
  open: "Open",
};

/**
 * Puntatore discreto: un punto che segue esatto e un anello che insegue con
 * un filo di ritardo. Sugli elementi marcati data-cursor l'anello si apre e
 * mostra l'azione. In blend difference, quindi resta leggibile sia sul film
 * scuro sia sulle sezioni avorio.
 */
export default function Cursor() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const p = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
    let raf = 0;

    const move = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      const hit = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      const kind = hit?.getAttribute("data-cursor") ?? "";
      setState(kind);
      setLabel(LABELS[kind] ?? "");
    };

    const loop = () => {
      p.rx += (p.x - p.rx) * 0.18;
      p.ry += (p.y - p.ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.cursor} data-state={state} aria-hidden="true">
      <span ref={dot} className={styles.dot} />
      <span ref={ring} className={styles.ring}>
        <span className={styles.label}>{label}</span>
      </span>
    </div>
  );
}
