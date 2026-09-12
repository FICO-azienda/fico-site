"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Approach.module.css";
import { prefersReducedMotion } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";

const STEPS = [
  { n: "01", name: "Discover", text: "We start from the business: what it sells, who decides, what it feels like to walk in. The brief comes out of that conversation, not before it." },
  { n: "02", name: "Design", text: "Structure first, then surface. You see the site as a design long before it exists as code, and we revise it together until it is right." },
  { n: "03", name: "Build", text: "Written by hand, accessible, fast on a phone on mobile data. Every animation has a reason to be there or it does not ship." },
  { n: "04", name: "Evolve", text: "We launch, measure and keep refining. You are left with a site you can run, and the numbers to know what is working." },
];

export default function Approach() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLHeadingElement>(null);
  const second = useRef<HTMLHeadingElement>(null);
  const [on, setOn] = useState<number[]>([]);
  useReveal(root);

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
        <h2 ref={first} className={`display d-xl ${styles.phrase}`}>
          Not just
          <br />
          a website.
        </h2>
        <h2 ref={second} className={`display d-xl ${styles.phrase}`}>
          A digital
          <br />
          <em>experience.</em>
        </h2>
      </div>

      <div className={styles.steps}>
        <div className={styles.stepsHead}>
          <p className="eyebrow reveal">Our approach</p>
          <h3 className="display d-md reveal">Four movements,<br />start to launch.</h3>
        </div>
        {STEPS.map((s, i) => (
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
