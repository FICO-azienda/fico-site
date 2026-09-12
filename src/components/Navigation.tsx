"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Navigation.module.css";
import { getLenis, scrollToId } from "@/animations/scroll";

const LINKS = [
  { href: "#worlds", label: "Work" },
  { href: "#studio", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

export default function Navigation() {
  const nav = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [onLight, setOnLight] = useState(false);

  /* il logo entra solo a film cominciato, non sopra il caricamento */
  useEffect(() => {
    const show = () =>
      gsap.to(`.${styles.logo}, .${styles.links}, .${styles.sound}, .${styles.toggle}`, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.06,
      });
    window.addEventListener("fico:entered", show);
    return () => window.removeEventListener("fico:entered", show);
  }, []);

  /*
    Contrasto automatico. Invece di uno ScrollTrigger per sezione — che con i
    pin si disallinea facilmente — si guarda a ogni scroll quale elemento
    marcato data-surface sta effettivamente sotto la barra. L'ultimo che la
    interseca vince, cosi' una sezione chiara annidata dentro una scura
    (il finale della CTA) viene rilevata correttamente.
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

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const id = window.setInterval(measure, 500); // rete di sicurezza dopo i refresh dei pin

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearInterval(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      void a.play().then(() => gsap.to(a, { volume: 0.32, duration: 1.6 })).catch(() => {});
      setSound(true);
    }
  };

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => scrollToId(href), open ? 500 : 0);
  };

  return (
    <>
      <header
        ref={nav}
        className={styles.nav}
        data-on={onLight && !open ? "light" : "dark"}
        data-menu={open ? "true" : "false"}
      >
        <a className={styles.logo} href="#top" onClick={(e) => go(e, "#top")} data-cursor="open">
          <img className={styles.logoMark} src="/img/fico-mark.png" alt="" aria-hidden="true" />
          <span className={styles.logoWord}>FICO</span>
        </a>

        <nav className={styles.links} aria-label="Principale">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} data-cursor="explore">
              {l.label}
            </a>
          ))}
        </nav>

        <button
          className={styles.sound}
          onClick={toggleSound}
          data-on={sound}
          aria-pressed={sound}
          aria-label={sound ? "Disattiva la musica" : "Attiva la musica"}
        >
          <span className={styles.bars} aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          {sound ? "Sound on" : "Sound"}
        </button>

        <button
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div id="menu" className={styles.menu} data-open={open}>
        <nav className={styles.menuLinks} aria-label="Menu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={(e) => go(e, "#contact")}>Start a project</a>
        </nav>
        <p className={`body ${styles.menuFoot}`}>
          FICO — digital studio.
          <br />
          ciao@fico.studio
        </p>
      </div>

      <audio ref={audio} src="/audio/fico-score.m4a" preload="none" />
    </>
  );
}
