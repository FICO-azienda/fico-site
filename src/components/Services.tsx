"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Services.module.css";
import { useReveal } from "@/lib/useReveal";
import type { Dict } from "@/i18n/dictionaries";

const SHOTS = [
  "/img/services/terrazza@portrait.webp",
  "/img/worlds/services@portrait.webp",
  "/img/worlds/retail@portrait.webp",
];


export default function Services({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useReveal(root);
  const items = dict.services.items;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.item}`).forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 62%",
          end: "bottom 42%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="services" className={styles.services} data-surface="light">
      <div className={styles.head}>
        <p className="eyebrow reveal">{dict.services.eyebrow}</p>
        <div>
          <h2 className="display d-md reveal">{dict.services.title}</h2>
          <p className="body reveal" style={{ marginTop: "1.2rem", color: "var(--on-light-dim)" }}>
            {dict.services.intro}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.media} aria-hidden="true">
          {items.map((s, i) => (
            <img
              key={s.n}
              className={styles.shot}
              src={SHOTS[i % SHOTS.length]}
              alt=""
              data-on={active === i}
              loading="lazy"
              decoding="async"
            />
          ))}
          <span className={styles.mediaEdge} />
        </div>

        <div className={styles.list}>
          {items.map((s, i) => (
            <article key={s.n} className={styles.item} data-on={active === i}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h3 className={styles.name}>{s.name}</h3>
                <p className={styles.desc}>{s.text}</p>
                <p className={styles.desc} style={{ marginTop: ".7rem", color: "var(--on-light-faint)" }}>{s.who}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
