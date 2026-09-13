import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { PROJECTS, getProject } from "@/data/projects";
import p from "@/components/PageHead.module.css";
import c from "@/components/CaseStudy.module.css";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => PROJECTS.map((pr) => ({ lang, slug: pr.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) return {};
  return { title: project.name, description: project.copy[lang].short };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const d = getDict(lang);
  const copy = project.copy[lang];

  return (
    <main className={p.page} data-surface="light">
      {/*
        Pagina volutamente breve. Chi arriva qui vuole capire in mezzo minuto
        di cosa si tratta e poi vedere il sito vero: il pulsante per entrare
        sta in alto, non in fondo, e si ripete alla fine.
      */}
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>
          <span>{d.work.eyebrow}</span>
          <span>{project.year}</span>
        </p>

        <div className={c.intro}>
          <div className={c.introPlate} style={{ background: project.plate }}>
            <img src={project.logo} alt={project.name} />
          </div>
          <div>
            <h1 className={`display d-lg ${p.title}`}>{project.name}</h1>
            <p className={p.lede}>{copy.short}</p>
            {project.url && (
              <a
                className="btn btn--solid magnetic"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                data-cursor="open"
                style={{ marginTop: "2.2rem" }}
              >
                {d.work.visit}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={p.body}>
        <dl className={c.facts}>
          <div><dt>{d.work.sector}</dt><dd>{copy.sector}</dd></div>
          <div><dt>{d.work.scope}</dt><dd>{copy.scope.join(" · ")}</dd></div>
          <div><dt>{d.work.year}</dt><dd>{project.year}</dd></div>
        </dl>

        {copy.blocks.map((b) => (
          <section className={c.block} key={b.label}>
            <p className={c.blockLabel}>{b.label}</p>
            <p className={c.blockText}>{b.text}</p>
          </section>
        ))}

        {project.url && (
          <div className={c.tail}>
            <a className="btn btn--solid magnetic" href={project.url} target="_blank" rel="noreferrer" data-cursor="open">
              {d.work.visit}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
