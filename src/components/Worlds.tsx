"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Worlds.module.css";
import { isLightDevice } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";

/*
  Settori in cui lo studio puo' lavorare: non sono clienti, non sono lavori
  svolti. Il testo lo dice chiaramente per non spacciare un portfolio inesistente.
*/
const WORLDS = [
  { name: "Hospitality", tag: "Hotels, restaurants, retreats", shot: "/img/worlds/hospitality.webp" },
  { name: "Fashion", tag: "Ateliers, labels, showrooms", shot: "/img/worlds/fashion.webp" },
  { name: "Retail", tag: "Boutiques and flagship stores", shot: "/img/worlds/retail.webp" },
  { name: "Automotive", tag: "Dealers, restorers, collections", shot: "/img/worlds/automotive.webp" },
  { name: "Professional services", tag: "Studios, consultancies, practices", shot: "/img/worlds/services.webp" },
  { name: "Food", tag: "Producers, cellars, makers", shot: "/img/worlds/food.webp" },
  { name: "Luxury", tag: "Objects made to last", shot: "/img/worlds/luxury.webp" },
  { name: "Local businesses", tag: "The shop on your street", shot: "/img/worlds/local.webp" },
];

export default function Worlds() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [touch, setTouch] = useState(false);
  useReveal(root);

  useEffect(() => {
    setTouch(isLightDevice());
  }, []);

  /* senza puntatore il mondo attivo lo decide lo scorrimento */
  useEffect(() => {
    if (!touch) return;
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.row}`).forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 68%",
          end: "bottom 48%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, el);
    return () => ctx.revert();
  }, [touch]);

  return (
    <section ref={root} id="worlds" className={styles.worlds} data-surface="dark">
      <div className={styles.bg} aria-hidden="true">
        {WORLDS.map((w, i) => (
          <img
            key={w.name}
            className={styles.bgShot}
            src={w.shot}
            alt=""
            data-on={active === i}
            loading="lazy"
            decoding="async"
          />
        ))}
        <span className={styles.bgVeil} />
      </div>

      <div className={styles.inner}>
        <div className={styles.head}>
          <p className="eyebrow reveal">Selected worlds</p>
          <div>
            <h2 className="display d-md reveal">
              The kinds of business
              <br />
              we build for.
            </h2>
            <p className={`body ${styles.note} reveal`}>
              FICO is a young studio: these are the worlds we are equipped to work in,
              not a list of past clients. The film above is our own work.
            </p>
          </div>
        </div>

        <div className={styles.list}>
          {WORLDS.map((w, i) => (
            <div
              key={w.name}
              className={styles.row}
              data-on={active === i}
              onMouseEnter={() => !touch && setActive(i)}
              data-cursor="explore"
            >
              <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.name}>{w.name}</h3>
              <span className={styles.tag}>{w.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
