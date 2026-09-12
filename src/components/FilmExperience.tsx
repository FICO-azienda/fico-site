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
import { createVideoScrub, type ScrubHandle } from "@/animations/videoScrub";
import { isLightDevice, prefersReducedMotion } from "@/animations/scroll";

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

export default function FilmExperience() {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const seamLogoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    const el = root.current;
    if (!video || !el) return;

    const reduced = prefersReducedMotion();
    const light = isLightDevice();

    // Sorgente scelta a runtime: su mobile il file leggero, che non verra'
    // comunque scrubbato ma riprodotto normalmente.
    video.src = light ? "/video/fico-film-mobile.mp4" : "/video/fico-film.mp4";
    video.load();

    let announced = false;
    const announce = () => {
      if (announced) return;
      announced = true;
      window.dispatchEvent(new CustomEvent("fico:film-ready"));
      gsap.to(posterRef.current, { opacity: 0, duration: 1.1, ease: "power2.out" });
    };
    // basta poter iniziare: non si aspetta l'intero film per far entrare l'utente
    video.addEventListener("loadeddata", announce);
    video.addEventListener("canplay", announce);
    const safety = window.setTimeout(announce, 6000);

    if (reduced) {
      // niente pin, niente scrub: il film resta un'immagine e i testi si leggono
      el.dataset.static = "true";
      gsap.set(chapterRefs.current.filter(Boolean), { opacity: 1, visibility: "visible" });
      return () => {
        window.clearTimeout(safety);
        video.removeEventListener("loadeddata", announce);
        video.removeEventListener("canplay", announce);
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    let scrub: ScrubHandle | null = null;
    const lastWeight = new Map<number, number>();

    /**
     * Dimensioni del fotogramma cosi' come lo vede l'utente: il video e'
     * in object-fit cover, quindi va ricalcolato a ogni resize per poter
     * posare il logo del sito esattamente sopra quello del film.
     */
    const placeSeamLogo = () => {
      const logo = seamLogoRef.current;
      const vp = viewport.current;
      if (!logo || !vp) return;
      const vw = vp.clientWidth;
      const vh = vp.clientHeight;
      const scale = Math.max(vw / SEAM_LOGO.frameW, vh / SEAM_LOGO.frameH);
      const w = SEAM_LOGO.frameW * SEAM_LOGO.width * scale;
      const cx = vw / 2 + (SEAM_LOGO.centerX - 0.5) * SEAM_LOGO.frameW * scale;
      const cy = vh / 2 + (SEAM_LOGO.centerY - 0.5) * SEAM_LOGO.frameH * scale;
      logo.style.width = `${w}px`;
      logo.style.left = `${cx - w / 2}px`;
      logo.style.top = `${cy - w / SEAM_LOGO.aspect / 2}px`;
    };
    placeSeamLogo();

    /*
      Quando la giuntura copre lo schermo il film e' di fatto una superficie
      chiara: lo dichiara, cosi' la navigazione passa al verde scuro e non
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

    const ctx = gsap.context(() => {
      const screens = light ? SCROLL_SCREENS_LIGHT : SCROLL_SCREENS_DESKTOP;

      /*
        Il film segue lo scroll su tutti i dispositivi, altrimenti su telefono
        la riproduzione libera finirebbe prima o dopo la sezione e la giuntura
        finale non cadrebbe mai al punto giusto. Sui dispositivi leggeri pero'
        si usa il file piccolo e si chiedono molti meno seek: il passo e' piu'
        grosso, ma non c'e' ingolfamento del decoder.
      */
      scrub = createVideoScrub(
        video,
        (t) => {
          setChapters(t);
          const seam = gsap.utils.clamp(
            0,
            1,
            (t - SEAM_START) / (FILM_DURATION - SEAM_START - 0.35),
          );
          applySeam(seam);
        },
        light ? { damping: 0.2, threshold: 0.22 } : { damping: 0.14, threshold: 0.02 },
      );

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * screens}`,
        pin: viewport.current,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
          if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p * 8));

          scrub?.setTarget(p * FILM_DURATION);
        },
      });
    }, el);

    const onResize = () => placeSeamLogo();
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadeddata", announce);
      video.removeEventListener("canplay", announce);
      scrub?.destroy();
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
        <video
          ref={videoRef}
          className={styles.video}
          poster="/img/poster.webp"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-label="Film di presentazione FICO"
        />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

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
                {c.lines.map((line, k) => (
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
        <p ref={hintRef} className={`eyebrow ${styles.hint}`}>Scroll</p>
      </div>
    </section>
  );
}
