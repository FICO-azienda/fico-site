"use client";

import { useRef } from "react";
import Link from "next/link";
import s from "./sections.module.css";
import w from "./Work.module.css";
import { useReveal } from "@/lib/useReveal";
import { PROJECTS } from "@/data/projects";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function WorkTeaser({ locale, dict }: { locale: Locale; dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const project = PROJECTS[0];
  if (!project) return null;
  const copy = project.copy[locale];

  return (
    <section ref={root} id="work" className={`${s.section} ${s.black}`} data-surface="dark">
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow reveal">{dict.work.eyebrow}</p>
          <h2 className={`display d-md reveal ${s.headText}`}>{dict.work.title}</h2>
        </div>

        {/*
          Percorso corto: il logo del cliente, due righe per capire di cosa si
          tratta, e da qui si entra direttamente nel sito. La pagina del
          progetto resta a disposizione di chi vuole sapere come è fatto.
        */}
        <article className={`${w.card} reveal`}>
          <div className={w.plate} style={{ background: project.plate }}>
            <img src={project.logo} alt={project.name} />
          </div>

          <div className={w.body}>
            <h3 className={w.name}>{project.name}</h3>
            <p className={w.meta}>{copy.sector} · {project.year}</p>
            <p className={w.short}>{copy.short}</p>
            <div className={w.actions}>
              {project.url && (
                <a className="btn btn--solid magnetic" href={project.url} target="_blank" rel="noreferrer" data-cursor="open">
                  {dict.work.visit}
                </a>
              )}
              <Link className="btn btn--on-dark" href={`/${locale}/work/${project.slug}`} data-cursor="view">
                {dict.work.detail}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
