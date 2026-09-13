"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import s from "./sections.module.css";
import g from "./WorkGallery.module.css";
import { useReveal } from "@/lib/useReveal";
import { PROJECTS } from "@/data/projects";
import { prefersReducedMotion } from "@/animations/scroll";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function WorkGallery({ locale, dict }: { locale: Locale; dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useReveal(root);

  const project = PROJECTS[0];

  /*
    La striscia scorre da sola, piano: serve a far capire che le schermate sono
    più d'una senza costringere a trascinare. Si ferma quando ci passi sopra,
    così puoi guardarne una, e sta ferma del tutto se l'utente ha ridotto le
    animazioni di sistema.
  */
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const half = el.scrollWidth / 2;
    if (half < 10) return;

    const tween = gsap.to(el, {
      x: -half,
      duration: half / 26,
      ease: "none",
      repeat: -1,
      modifiers: { x: (v) => `${parseFloat(v) % half}px` },
    });

    const band = el.parentElement;
    const slow = () => tween.timeScale(0.15);
    const back = () => tween.timeScale(1);
    band?.addEventListener("pointerenter", slow);
    band?.addEventListener("pointerleave", back);

    return () => {
      band?.removeEventListener("pointerenter", slow);
      band?.removeEventListener("pointerleave", back);
      tween.kill();
    };
  }, []);

  if (!project) return null;
  const copy = project.copy[locale];
  // due giri identici: quando il primo finisce il secondo è già in posizione
  const strip = [...project.shots, ...project.shots];

  return (
    <section ref={root} id="work" className={`${s.section} ${s.black}`} data-surface="dark">
      <div className={s.inner}>
        <div className={s.head} style={{ marginBottom: 0 }}>
          <p className="eyebrow reveal">{dict.work.eyebrow}</p>
          <h2 className={`display d-md reveal ${s.headText}`}>{dict.work.title}</h2>
        </div>
      </div>

      <div className={g.band}>
        <div className={g.track} ref={track}>
          {strip.map((shot, i) => (
            <figure key={`${shot.src}-${i}`} className={`${g.shot} ${g[shot.kind]}`}>
              <img
                src={shot.src}
                alt={`${project.name} — ${shot.label}`}
                loading={i < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <figcaption className={g.caption}>{shot.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className={s.inner}>
        <div className={`${g.foot} reveal`}>
          <div className={g.identity}>
            <img className={g.badge} src={project.logo} alt="" aria-hidden="true" />
            <div>
              <h3 className={g.name}>{project.name}</h3>
              <p className={g.meta}>{copy.sector} · {project.year}</p>
            </div>
          </div>

          <div className={g.actions}>
            {project.url && (
              <a className="btn btn--solid magnetic" href={project.url} target="_blank" rel="noreferrer" data-cursor="open">
                {dict.work.visit}
              </a>
            )}
            <Link className="btn btn--on-dark" href={`/${locale}/work/${project.slug}`} data-cursor="view">
              {dict.work.detail}
            </Link>
          </div>

          <p className={g.short}>{copy.short}</p>
        </div>
      </div>
    </section>
  );
}
