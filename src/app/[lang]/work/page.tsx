import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { PROJECTS } from "@/data/projects";
import p from "@/components/PageHead.module.css";
import w from "@/components/Work.module.css";

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
            <article key={project.slug} className={`${w.card} ${w.onLight}`}>
              <div className={w.plate} style={{ background: project.plate }}>
                <img src={project.logo} alt={project.name} />
              </div>
              <div>
                <h2 className={w.name}>{project.name}</h2>
                <p className={w.meta}>{copy.sector} · {project.year}</p>
                <p className={w.short}>{copy.short}</p>
                <div className={w.actions}>
                  {project.url && (
                    <a className="btn btn--solid magnetic" href={project.url} target="_blank" rel="noreferrer" data-cursor="open">
                      {d.work.visit}
                    </a>
                  )}
                  <Link className="btn" href={`/${lang}/work/${project.slug}`} data-cursor="view">
                    {d.work.detail}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
