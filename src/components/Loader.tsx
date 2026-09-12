"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Loader.module.css";

/**
 * Sequenza d'apertura: nero pieno, marchio piccolo, una riga che avanza.
 * Non e' una percentuale finta: la riga avanza piano per conto suo e scatta a
 * fondo scala quando il film e' davvero pronto a partire.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    document.body.classList.add("is-locked");

    const ctx = gsap.context(() => {
      gsap.to(`.${styles.mark}`, { opacity: 1, duration: 1.1, ease: "power2.out" });
      gsap.to(`.${styles.word}`, { opacity: 1, duration: 1.1, delay: 0.25, ease: "power2.out" });
      gsap.to(fill.current, { scaleX: 0.7, duration: 4.5, ease: "power2.out" });
    }, el);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.classList.remove("is-locked");
          el.style.display = "none";
          window.dispatchEvent(new CustomEvent("fico:entered"));
        },
      });
      tl.to(fill.current, { scaleX: 1, duration: 0.6, ease: "power2.inOut" })
        .to(`.${styles.inner}`, { opacity: 0, duration: 0.5, ease: "power2.in" }, "-=0.15")
        .to(el, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.2");
    };

    window.addEventListener("fico:film-ready", finish);
    const safety = window.setTimeout(finish, 9000);

    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("fico:film-ready", finish);
      document.body.classList.remove("is-locked");
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className={styles.loader}>
      <div className={styles.inner}>
        <img className={styles.mark} src="/img/fico-mark.png" alt="" aria-hidden="true" />
        <div className={styles.bar}>
          <span ref={fill} className={styles.fill} />
        </div>
        <p className={`eyebrow ${styles.word}`}>FICO</p>
      </div>
    </div>
  );
}
