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
  return { title: project.name, description: project.copy[lang].tagline };
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

  const blocks = [
    { label: d.work.challenge, text: copy.challenge },
    { label: d.work.idea, text: copy.idea },
    { label: d.work.design, text: copy.design },
    { label: d.work.build, text: copy.build },
    ...(copy.result ? [{ label: "Risultato", text: copy.result }] : []),
  ];

  return (
    <main className={p.page} data-surface="light">
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>
          <span>{d.work.eyebrow}</span>
          <span>{project.year}</span>
        </p>
        <h1 className={`display d-lg ${p.title}`}>{project.name}</h1>
        <p className={p.lede}>{copy.tagline}</p>
      </div>

      <figure className={c.cover}>
        <img src={project.cover} alt="" />
      </figure>

      <div className={p.body}>
        <dl className={c.facts}>
          <div><dt>{d.work.sector}</dt><dd>{copy.sector}</dd></div>
          <div><dt>{d.work.scope}</dt><dd>{copy.scope.join(" · ")}</dd></div>
          <div><dt>{d.work.year}</dt><dd>{project.year}</dd></div>
        </dl>

        {blocks.map((b, i) => (
          <section className={c.block} key={b.label}>
            <p className={c.blockLabel}>{b.label}</p>
            <p className={c.blockText}>{b.text}</p>
            {project.shots[i] && (
              <figure className={c.shot}>
                <img src={project.shots[i]} alt="" loading="lazy" decoding="async" />
              </figure>
            )}
          </section>
        ))}

        {project.url && (
          <a className="btn btn--solid" href={project.url} target="_blank" rel="noreferrer" data-cursor="open">
            {d.work.visit}
          </a>
        )}
      </div>
    </main>
  );
}
