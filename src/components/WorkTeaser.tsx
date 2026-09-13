"use client";

import { useRef } from "react";
import Link from "next/link";
import s from "./sections.module.css";
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

        <Link href={`/${locale}/work/${project.slug}`} className={`${s.workRow} reveal`} data-cursor="view">
          <div className={s.workShot}>
            <img src={project.cover} alt="" loading="lazy" decoding="async" />
          </div>
          <div>
            <h3 className={s.workName}>{project.name}</h3>
            <p className={s.workMeta}>{copy.sector} · {project.year}</p>
            <p className={s.workTag}>{copy.tagline}</p>
            <span className="btn btn--on-dark">{dict.work.all}</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
