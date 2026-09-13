"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import styles from "./Navigation.module.css";
import { getLenis } from "@/animations/scroll";
import { openAskFico } from "./AskFico";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function Navigation({ locale, dict }: { locale: Locale; dict: Dict }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: `/${locale}/work`, label: dict.nav.work },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}/studio`, label: dict.nav.studio },
  ];

  /* il logo entra a film cominciato, non sopra il caricamento */
  useEffect(() => {
    const show = () =>
      gsap.to(`.${styles.logo}, .${styles.links}, .${styles.tools}, .${styles.toggle}`, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.06,
      });
    window.addEventListener("fico:entered", show);
    // sulle pagine senza film non c'è nessun caricamento da attendere
    const t = window.setTimeout(show, 1200);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("fico:entered", show);
    };
  }, []);

  /*
    Contrasto automatico: a ogni scroll si guarda quale elemento marcato
    data-surface sta effettivamente sotto la barra. L'ultimo che la interseca
    vince, così una sezione chiara annidata in una scura viene rilevata bene.
  */
  useEffect(() => {
    const LINE = 26;
    let raf = 0;
    const measure = () => {
      raf = 0;
      let light = false;
      document.querySelectorAll<HTMLElement>("[data-surface]").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (r.top <= LINE && r.bottom > LINE) light = node.dataset.surface === "light";
      });
      setOnLight(light);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const id = window.setInterval(measure, 500);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearInterval(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const lenis = getLenis();
    document.body.classList.toggle("is-locked", open);
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleSound = () => {
    const a = audio.current;
    if (!a) return;
    if (sound) {
      gsap.to(a, { volume: 0, duration: 0.6, onComplete: () => a.pause() });
      setSound(false);
    } else {
      a.volume = 0;
      a.loop = true;
      void a.play().then(() => gsap.to(a, { volume: 0.3, duration: 1.6 })).catch(() => {});
      setSound(true);
    }
  };

  /** stessa pagina, altra lingua */
  const swap = (to: Locale) => {
    const rest = pathname.replace(/^\/(it|en)/, "");
    return `/${to}${rest}`;
  };

  const quote = () => {
    setOpen(false);
    window.setTimeout(openAskFico, open ? 400 : 0);
  };

  return (
    <>
      <header className={styles.nav} data-on={onLight && !open ? "light" : "dark"}>
        <Link className={styles.logo} href={`/${locale}`} data-cursor="open">
          <img className={styles.logoMark} src="/img/fico-mark.png" alt="" aria-hidden="true" />
          <span className={styles.logoWord}>FICO</span>
        </Link>

        <nav className={styles.links} aria-label="Principale">
          {links.map((l) => (
            <Link key={l.href} href={l.href} data-cursor="explore">{l.label}</Link>
          ))}
        </nav>

        <div className={styles.tools}>
          <span className={styles.langs}>
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={swap(l)}
                data-on={l === locale}
                className={styles.lang}
                hrefLang={l}
                data-cursor="explore"
              >
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </span>

          <button
            className={styles.sound}
            onClick={toggleSound}
            data-on={sound}
            aria-pressed={sound}
            aria-label={sound ? dict.nav.soundOn : dict.nav.sound}
          >
            <span className={styles.bars} aria-hidden="true"><i /><i /><i /><i /></span>
          </button>

          <button className={`${styles.quote} magnetic`} onClick={quote} data-cursor="open">
            {dict.nav.quote}
          </button>
        </div>

        <button className={styles.toggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? dict.nav.close : dict.nav.menu}
        </button>
      </header>

      <div className={styles.menu} data-open={open}>
        <nav className={styles.menuLinks} aria-label="Menu">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <button onClick={quote}>{dict.nav.quote}</button>
        </nav>
        <div className={styles.menuFoot}>
          <span className={styles.langs}>
            {LOCALES.map((l) => (
              <Link key={l} href={swap(l)} data-on={l === locale} className={styles.lang} onClick={() => setOpen(false)}>
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </span>
          <a href="mailto:ficolc78@gmail.com">ficolc78@gmail.com</a>
        </div>
      </div>

      <audio ref={audio} src="/audio/fico-score.m4a" preload="none" />
    </>
  );
}
