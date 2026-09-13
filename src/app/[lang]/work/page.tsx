import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { PROJECTS } from "@/data/projects";
import p from "@/components/PageHead.module.css";
import s from "@/components/sections.module.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDict(lang).nav.work };
}

export default async function WorkIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <main className={p.page} data-surface="light">
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>{d.work.eyebrow}</p>
        <h1 className={`display d-lg ${p.title}`}>{d.work.title}</h1>
      </div>

      <div className={p.body}>
        {PROJECTS.map((project) => {
          const copy = project.copy[lang];
          return (
            <Link
              key={project.slug}
              href={`/${lang}/work/${project.slug}`}
              className={s.workRow}
              data-cursor="view"
              style={{ paddingTop: "2rem", borderTop: "1px solid rgba(22,54,40,.16)" }}
            >
              <div className={s.workShot}>
                <img src={project.cover} alt="" loading="lazy" decoding="async" />
              </div>
              <div>
                <h2 className={s.workName} style={{ color: "var(--on-light)" }}>{project.name}</h2>
                <p className={s.workMeta} style={{ color: "var(--on-light-faint)" }}>
                  {copy.sector} · {project.year}
                </p>
                <p className={s.workTag} style={{ color: "var(--on-light-dim)" }}>{copy.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
