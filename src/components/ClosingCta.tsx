"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ClosingCta.module.css";
import { prefersReducedMotion } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";
import { openAskFico } from "./AskFico";
import type { Dict } from "@/i18n/dictionaries";

export default function ClosingCta({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLSpanElement>(null);
  const first = useRef<HTMLHeadingElement>(null);
  const second = useRef<HTMLHeadingElement>(null);
  useReveal(root);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set([first.current, second.current], { opacity: 1, position: "static" });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(second.current, { opacity: 0, yPercent: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.8}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.to(first.current, { opacity: 0, yPercent: -12, filter: "blur(6px)", duration: 1 }, 0.3)
        .to(second.current, { opacity: 1, yPercent: 0, duration: 1 }, 0.5)
        // il nero si apre in avorio: e' lo stesso colore in cui finisce il film
        .to(wash.current, { opacity: 1, duration: 1.1 }, 1.5)
        .to(second.current, { color: "#163628", duration: 0.9 }, 1.6);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="contact" className={styles.closing} data-surface="dark">
      <div ref={stage} className={styles.stage}>
        <span ref={wash} className={styles.wash} aria-hidden="true" />
        <h2 ref={first} className={`display d-xl ${styles.phrase}`} style={{ whiteSpace: "pre-line" }}>
          {dict.contact.phrase1}
        </h2>
        <h2 ref={second} className={`display d-xl ${styles.phrase}`} style={{ whiteSpace: "pre-line" }}>
          {dict.contact.phrase2}
        </h2>
      </div>

      <div className={styles.outro} data-surface="light">
        <img className={`${styles.lockup} reveal`} src="/img/fico-lockup.png" alt="FICO" />
        <h2 className={`display d-md reveal`} style={{ whiteSpace: "pre-line", margin: "0" }}>
          {dict.contact.title}
        </h2>
        <p className={`body-lg ${styles.line} reveal`}>{dict.contact.sub}</p>
        <div className={`${styles.actions} reveal`}>
          <button className="btn btn--solid magnetic" onClick={(e) => openAskFico(e.currentTarget)} data-cursor="open">
            {dict.contact.cta}
          </button>
        </div>
        <p className={`${styles.mail} reveal`} style={{ color: "var(--on-light-dim)", fontSize: "0.9rem" }}>
          {dict.contact.or}{" "}
          <a className="link" href="mailto:ficolc78@gmail.com" data-cursor="open">ficolc78@gmail.com</a>
        </p>
      </div>
    </section>
  );
}
