"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Services.module.css";
import { useReveal } from "@/lib/useReveal";

const SERVICES = [
  {
    n: "01",
    name: "Web Design",
    desc: "Layout, typography and rhythm built around one business, drawn before a single line of code.",
    shot: "/img/worlds/hospitality@portrait.webp",
  },
  {
    n: "02",
    name: "Web Development",
    desc: "Hand-written front-end, fast on every device, structured so the site can be edited without us.",
    shot: "/img/worlds/services@portrait.webp",
  },
  {
    n: "03",
    name: "Digital Identity",
    desc: "Colour, material and language carried from the physical business into the screen.",
    shot: "/img/worlds/fashion@portrait.webp",
  },
  {
    n: "04",
    name: "Interactive Experiences",
    desc: "Scroll-driven film, motion and three-dimensional detail — used only where they carry meaning.",
    shot: "/img/worlds/local@portrait.webp",
  },
  {
    n: "05",
    name: "E-commerce",
    desc: "Catalogue, checkout and logistics designed around the decision to buy, not around the software.",
    shot: "/img/worlds/retail@portrait.webp",
  },
];

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useReveal(root);

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
        <p className="eyebrow reveal">What we do</p>
        <h2 className="display d-md reveal">
          Five disciplines,
          <br />
          one continuous craft.
        </h2>
      </div>

      <div className={styles.grid}>
        <div className={styles.media} aria-hidden="true">
          {SERVICES.map((s, i) => (
            <img
              key={s.n}
              className={styles.shot}
              src={s.shot}
              alt=""
              data-on={active === i}
              loading="lazy"
              decoding="async"
            />
          ))}
          <span className={styles.mediaEdge} />
        </div>

        <div className={styles.list}>
          {SERVICES.map((s, i) => (
            <article key={s.n} className={styles.item} data-on={active === i}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h3 className={styles.name}>{s.name}</h3>
                <p className={styles.desc}>{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
