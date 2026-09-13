"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import s from "./sections.module.css";
import { useReveal } from "@/lib/useReveal";
import { prefersReducedMotion } from "@/animations/scroll";
import type { Dict } from "@/i18n/dictionaries";

export default function Faq({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  /* apertura a fisarmonica: una domanda per volta, altezza animata */
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const items = Array.from(el.querySelectorAll<HTMLDetailsElement>("details"));
    const bodies = new Map(items.map((i) => [i, i.querySelector<HTMLElement>("[data-body]")!]));
    items.forEach((i) => gsap.set(bodies.get(i)!, { height: 0 }));

    const onClick = (e: MouseEvent) => {
      const summary = (e.target as HTMLElement).closest("summary");
      if (!summary) return;
      e.preventDefault();
      const item = summary.parentElement as HTMLDetailsElement;
      const body = bodies.get(item)!;
      if (item.open) {
        gsap.to(body, { height: 0, duration: 0.42, ease: "power3.inOut", onComplete: () => item.removeAttribute("open") });
        return;
      }
      items.forEach((other) => {
        if (other !== item && other.open) {
          gsap.to(bodies.get(other)!, { height: 0, duration: 0.38, ease: "power3.inOut", onComplete: () => other.removeAttribute("open") });
        }
      });
      item.setAttribute("open", "");
      gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.52, ease: "power3.out" });
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <section ref={root} id="faq" className={`${s.section} ${s.light}`} data-surface="light">
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow reveal">{dict.faq.eyebrow}</p>
          <h2 className={`display d-md reveal ${s.headText}`}>{dict.faq.title}</h2>
        </div>
        <div className={s.faqList}>
          {dict.faq.items.map((item) => (
            <details className={s.qa} key={item.q}>
              <summary data-cursor="explore">{item.q}</summary>
              <div className={s.qaBody} data-body>
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
