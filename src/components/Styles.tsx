"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./Styles.module.css";
import { STYLES } from "@/data/styles";
import { canPinHorizontal, prefersReducedMotion } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";
import { openAskFico } from "./AskFico";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function Styles({ locale, dict }: { locale: Locale; dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useReveal(root);

  /*
    Su schermo grande la sezione si ferma e le schede scorrono di lato mentre
    si continua a scendere. Su telefono no: diventa una striscia che si
    trascina col dito, con l'aggancio a ogni scheda. Bloccare lo scorrimento
    verticale su un telefono è il modo piu' rapido per far chiudere la pagina.
  */
  useEffect(() => {
    const el = root.current;
    const strip = track.current;
    if (!el || !strip) return;
    if (prefersReducedMotion() || !canPinHorizontal()) return;

    gsap.registerPlugin(ScrollTrigger);
    let tween: gsap.core.Tween | null = null;

    const build = () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      gsap.set(strip, { x: 0 });
      const distance = strip.scrollWidth - window.innerWidth + 40;
      if (distance <= 0) return;

      tween = gsap.to(strip, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance + window.innerHeight * 0.4}`,
          pin: pin.current,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    };

    build();
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, []);

  return (
    <section ref={root} id="styles" className={s.styles} data-surface="dark">
      <div ref={pin} className={s.pin}>
        <div className={s.head}>
          <p className="eyebrow reveal">{dict.styles.eyebrow}</p>
          <div>
            <h2 className="display d-md reveal">{dict.styles.title}</h2>
            <p className={`${s.intro} reveal`}>{dict.styles.intro}</p>
          </div>
        </div>

        <div className={s.track} ref={track}>
          {STYLES.map((style, i) => {
            const c = style.copy[locale];
            return (
              <article className={s.card} key={style.id}>
                <div className={s.frame} style={{ background: style.tone }}>
                  <img
                    src={style.image}
                    srcSet={`${style.image.replace(".webp", "@sm.webp")} 700w, ${style.image} 1400w`}
                    sizes="(max-width: 900px) 80vw, 32vw"
                    alt={`${c.name} — ${c.mood}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className={s.body}>
                  <h3 className={s.name}>{c.name}</h3>
                  <p className={s.mood}>{c.mood}</p>
                  <p className={s.fit}>
                    <span className={s.fitLabel}>{dict.styles.fitLabel}</span>
                    {c.fit}
                  </p>
                </div>
              </article>
            );
          })}

          <article className={`${s.card} ${s.last}`}>
            <div className={s.lastInner}>
              <p className={s.lastText}>{dict.styles.title}</p>
              <button className="btn btn--on-dark magnetic" onClick={(e) => openAskFico(e.currentTarget)} data-cursor="open">
                {dict.styles.cta}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
