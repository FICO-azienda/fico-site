"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./Styles.module.css";
import { STYLES } from "@/data/styles";
import { isCoarsePointer, prefersReducedMotion } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";
import { openAskFico } from "./AskFico";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function Styles({ locale, dict }: { locale: Locale; dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useReveal(root);

  const [mode, setMode] = useState<"pin" | "swipe">("swipe");
  const [pointer, setPointer] = useState<"fine" | "coarse">("coarse");
  const [edges, setEdges] = useState({ start: true, end: false });

  /*
    Una sola decisione, presa qui e scritta in data-mode: il CSS la segue.
    Col mouse la sezione si blocca e le schede scorrono di lato mentre si
    scende. Su touch, o con le animazioni ridotte, diventa una striscia da
    trascinare: bloccare lo scorrimento verticale su un telefono è il modo più
    rapido per far chiudere la pagina.
  */
  useEffect(() => {
    const el = root.current;
    const strip = track.current;
    if (!el || !strip) return;
    gsap.registerPlugin(ScrollTrigger);

    let tween: gsap.core.Tween | null = null;
    const kill = () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
      gsap.set(strip, { clearProps: "transform" });
    };

    const build = () => {
      const fine = !isCoarsePointer();
      const next = fine && !prefersReducedMotion() && window.innerWidth >= 700 ? "pin" : "swipe";
      el.dataset.mode = next;
      setPointer(fine ? "fine" : "coarse");
      setMode(next);
      kill();
      if (next !== "pin") return;

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
      t = window.setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      kill();
    };
  }, []);

  /* frecce della striscia: attive o spente a seconda di dove si è arrivati */
  useEffect(() => {
    const strip = track.current;
    if (!strip || mode !== "swipe") return;
    const update = () =>
      setEdges({
        start: strip.scrollLeft < 8,
        end: strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 8,
      });
    update();
    strip.addEventListener("scroll", update, { passive: true });
    return () => strip.removeEventListener("scroll", update);
  }, [mode]);

  const step = (dir: 1 | -1) => {
    const strip = track.current;
    const card = strip?.querySelector("article");
    if (!strip || !card) return;
    const gap = parseFloat(getComputedStyle(strip).columnGap) || 24;
    strip.scrollBy({
      left: dir * (card.getBoundingClientRect().width + gap),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section ref={root} id="styles" className={s.styles} data-surface="dark" data-mode={mode} data-pointer={pointer}>
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

        <div className={s.arrows}>
          <button className={s.arrow} onClick={() => step(-1)} disabled={edges.start} aria-label={locale === "it" ? "Stile precedente" : "Previous style"}>
            <span aria-hidden="true">←</span>
          </button>
          <button className={s.arrow} onClick={() => step(1)} disabled={edges.end} aria-label={locale === "it" ? "Stile successivo" : "Next style"}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
