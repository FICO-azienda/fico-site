"use client";

import { useRef } from "react";
import s from "./sections.module.css";
import { useReveal } from "@/lib/useReveal";
import type { Dict } from "@/i18n/dictionaries";

export default function Team({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const d = dict.studio;

  return (
    <section ref={root} id="studio" className={`${s.section} ${s.dark}`} data-surface="dark">
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow reveal">{d.eyebrow}</p>
          <div>
            <h2 className="display d-lg reveal" style={{ whiteSpace: "pre-line", marginBottom: "1.8rem" }}>
              {d.title}
            </h2>
            <p className={`${s.studioText} reveal`}>{d.text}</p>
          </div>
        </div>
        <div className={s.people}>
          {d.people.map((p) => (
            <article key={p.name} className={`${s.person} reveal`}>
              <h3 className={s.personName}>{p.name}</h3>
              <p className={s.personLine}>{p.line}</p>
              <p className={s.personFocus}>{p.focus}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
