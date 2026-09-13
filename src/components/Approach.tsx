"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Approach.module.css";
import { prefersReducedMotion } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";
import type { Dict } from "@/i18n/dictionaries";


export default function Approach({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLHeadingElement>(null);
  const second = useRef<HTMLHeadingElement>(null);
  const [on, setOn] = useState<number[]>([]);
  useReveal(root);
  const steps = dict.process.steps;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set([first.current, second.current], { opacity: 1, y: 0, position: "static" });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(second.current, { opacity: 0, yPercent: 14 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.6}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      tl.to(first.current, { opacity: 0, yPercent: -14, filter: "blur(6px)", duration: 1 }, 0.35)
        .to(second.current, { opacity: 1, yPercent: 0, duration: 1 }, 0.55);

      gsap.utils.toArray<HTMLElement>(`.${styles.step}`).forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 78%",
          once: true,
          onEnter: () => setOn((prev) => (prev.includes(i) ? prev : [...prev, i])),
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="approach" className={styles.approach} data-surface="dark">
      <div ref={stage} className={styles.statement}>
        <span className={styles.glow} aria-hidden="true" />
        <h2 ref={first} className={`display d-xl ${styles.phrase}`} style={{ whiteSpace: "pre-line" }}>
          {dict.process.phrase1}
        </h2>
        <h2 ref={second} className={`display d-xl ${styles.phrase}`} style={{ whiteSpace: "pre-line" }}>
          {dict.process.phrase2}
        </h2>
      </div>

      <div className={styles.steps}>
        <div className={styles.stepsHead}>
          <p className="eyebrow reveal">{dict.process.eyebrow}</p>
          <h3 className="display d-md reveal">{dict.process.title}</h3>
        </div>
        {steps.map((s, i) => (
          <article key={s.n} className={styles.step} data-on={on.includes(i)}>
            <span className={styles.stepNum}>{s.n}</span>
            <h4 className={styles.stepName}>{s.name}</h4>
            <p className={styles.stepText}>{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
