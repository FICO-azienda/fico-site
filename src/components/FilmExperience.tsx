"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FilmExperience.module.css";
import {
  CHAPTERS,
  FILM_DURATION,
  SEAM_LOGO,
  SEAM_START,
  chapterWeight,
  type Chapter,
} from "@/lib/film";
import { createFrameScrub, type FrameScrub } from "@/animations/frameScrub";
import { isCoarsePointer, prefersReducedMotion } from "@/animations/scroll";
import { openAskFico } from "./AskFico";
import type { Dict } from "@/i18n/dictionaries";

const PLACE: Record<Chapter["place"], string> = {
  corner: styles.corner,
  "bottom-left": styles.bottomLeft,
  "right-mid": styles.rightMid,
  "left-low": styles.leftLow,
  "right-high": styles.rightHigh,
  "left-mid": styles.leftMid,
  "center-wide": styles.centerWide,
  "left-big": styles.leftBig,
};

/** quante schermate di scroll dura il film */
const SCROLL_SCREENS_DESKTOP = 7;
const SCROLL_SCREENS_LIGHT = 4.5;

export default function FilmExperience({ dict }: { dict: Dict }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const seamLogoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = root.current;
    const vp = viewport.current;
    if (!canvas || !el || !vp) return;

    const reduced = prefersReducedMotion();
    const compact = window.innerWidth < 900 || isCoarsePointer();

    let announced = false;
    const announce = () => {
      if (announced) return;
      announced = true;
      window.dispatchEvent(new CustomEvent("fico:film-ready"));
      gsap.to(posterRef.current, { opacity: 0, duration: 1.1, ease: "power2.out" });
    };
    // rete di sicurezza: se la rete è lentissima si entra comunque, sul poster
    const safety = window.setTimeout(announce, 6000);

    if (reduced) {
      // niente pin, niente scrub: il film resta un'immagine e i testi si leggono
      el.dataset.static = "true";
      gsap.set(chapterRefs.current.filter(Boolean), { opacity: 1, visibility: "visible" });
      announce();
      return () => window.clearTimeout(safety);
    }

    gsap.registerPlugin(ScrollTrigger);
    const lastWeight = new Map<number, number>();

    /*
      Quando la giuntura copre lo schermo il film è di fatto una superficie
      chiara: lo dichiara, così la navigazione passa al verde scuro e non
      resta bianca sull'avorio.
    */
    const applySeam = (v: number) => {
      if (seamRef.current) seamRef.current.style.opacity = String(v);
      if (seamLogoRef.current) seamLogoRef.current.style.opacity = String(v);
      el.dataset.surface = v > 0.6 ? "light" : "dark";
    };

    const setChapters = (t: number) => {
      CHAPTERS.forEach((c, i) => {
        const node = chapterRefs.current[i];
        if (!node) return;
        const w = chapterWeight(c, t);
        if (lastWeight.get(i) === w) return;
        lastWeight.set(i, w);
        if (w === 0) {
          if (node.style.visibility !== "hidden") node.style.visibility = "hidden";
          node.style.opacity = "0";
          return;
        }
        node.style.visibility = "visible";
        node.style.opacity = String(w);
        const lines = node.querySelectorAll<HTMLElement>(`.${styles.line}`);
        lines.forEach((ln, k) => {
          const stagger = Math.max(0, Math.min(1, w * 1.25 - k * 0.12));
          ln.style.transform = `translate3d(0, ${(1 - stagger) * 105}%, 0)`;
          ln.style.filter = stagger > 0.98 ? "none" : `blur(${(1 - stagger) * 7}px)`;
          ln.style.letterSpacing = `${(1 - stagger) * 0.07 - 0.035}em`;
        });
      });
    };

    const scrub: FrameScrub = createFrameScrub(canvas, {
      // Lenis ammorbidisce già lo scorrimento: uno smorzamento forte anche qui
      // sommava due inerzie e il film sembrava inseguire la rotella
      damping: compact ? 0.28 : 0.2,
      onReady: announce,
      onFrame: (t) => {
        setChapters(t);
        applySeam(gsap.utils.clamp(0, 1, (t - SEAM_START) / (FILM_DURATION - SEAM_START - 0.35)));
      },
    });

    /*
      Il logo della giuntura si posiziona con la stessa proiezione usata per
      disegnare i fotogrammi, e si ricalcola a ogni cambio di misura del
      riquadro — non solo al resize della finestra. Prima la posizione veniva
      presa una volta sola e restava vecchia: da lì il logo fuori centro.
    */
    const placeSeamLogo = () => {
      const logo = seamLogoRef.current;
      if (!logo) return;
      const fx = SEAM_LOGO.centerX * SEAM_LOGO.frameW;
      const fy = SEAM_LOGO.centerY * SEAM_LOGO.frameH;
      const { x, y, scale } = scrub.project(fx, fy);
      const w = SEAM_LOGO.width * SEAM_LOGO.frameW * scale;
      logo.style.width = `${w}px`;
      logo.style.left = `${x - w / 2}px`;
      logo.style.top = `${y - w / SEAM_LOGO.aspect / 2}px`;
    };
    placeSeamLogo();
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { ficoFilm?: FrameScrub }).ficoFilm = scrub;
    }
    const ro = new ResizeObserver(placeSeamLogo);
    ro.observe(vp);

    const ctx = gsap.context(() => {
      const screens = compact ? SCROLL_SCREENS_LIGHT : SCROLL_SCREENS_DESKTOP;

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * screens}`,
        pin: vp,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          // la proposta di valore resta leggibile a schermo fermo e si ritira
          // appena l'utente entra davvero nel film
          if (heroRef.current) {
            const out = gsap.utils.clamp(0, 1, p / 0.05);
            heroRef.current.style.opacity = String(1 - out);
            heroRef.current.style.transform = `translate3d(0, ${-out * 28}px, 0)`;
            heroRef.current.style.pointerEvents = out > 0.5 ? "none" : "auto";
          }
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
          if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p * 8));
          scrub.setTarget(p * FILM_DURATION);
        },
      });
    }, el);

    return () => {
      window.clearTimeout(safety);
      ro.disconnect();
      scrub.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className={styles.stage} id="film" data-surface="dark" aria-label="FICO, il film">
      <div ref={viewport} className={styles.viewport}>
        <img
          ref={posterRef}
          className={styles.poster}
          src="/img/poster.webp"
          alt=""
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className={styles.video} role="img" aria-label="Film di presentazione FICO" />
        <div className={styles.veil} aria-hidden="true" />

        <div ref={heroRef} className={styles.hero}>
          <p className={`eyebrow ${styles.heroEyebrow}`}>{dict.hero.eyebrow}</p>
          <h1 className={`display d-lg ${styles.heroTitle}`}>{dict.hero.title}</h1>
          <p className={styles.heroSub}>{dict.hero.sub}</p>
          <div className={styles.heroActions}>
            <button className="btn btn--solid magnetic" onClick={(e) => openAskFico(e.currentTarget)} data-cursor="open">
              {dict.hero.ctaPrimary}
            </button>
            <a className="btn btn--on-dark magnetic" href="#work" data-cursor="explore">
              {dict.hero.ctaSecondary}
            </a>
          </div>
          <a className={`eyebrow ${styles.heroSkip}`} href="#services" data-cursor="explore">
            {dict.hero.skip}
          </a>
        </div>

        <div className={styles.chapters}>
          {CHAPTERS.map((c, i) => (
            <div
              key={c.id}
              ref={(n) => {
                chapterRefs.current[i] = n;
              }}
              className={`${styles.chapter} ${PLACE[c.place]}`}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {c.eyebrow && <p className={`eyebrow ${styles.chapterEyebrow}`}>{c.eyebrow}</p>}
              <h2 className={`display ${c.size}`}>
                {(dict.film.chapters[i] ?? []).map((line, k) => (
                  <span className={styles.lineMask} key={k}>
                    <span className={styles.line}>{line}</span>
                  </span>
                ))}
              </h2>
            </div>
          ))}
        </div>

        {/* la giuntura: stesso avorio e stesso logo dell'ultimo fotogramma */}
        <div ref={seamRef} className={styles.seam} aria-hidden="true" />
        <div ref={seamLogoRef} className={styles.seamLogo} aria-hidden="true">
          <img src="/img/seam-logo.png" alt="" />
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span ref={progressRef} className={styles.progressFill} />
        </div>
        <p ref={hintRef} className={`eyebrow ${styles.hint}`}>{dict.hero.scroll}</p>
      </div>
    </section>
  );
}
