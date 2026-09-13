import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import p from "@/components/PageHead.module.css";
import s from "@/components/sections.module.css";
import c from "@/components/CaseStudy.module.css";
import QuoteButton from "@/components/QuoteButton";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return { title: d.nav.studio, description: d.studio.text.slice(0, 150) };
}

export default async function StudioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <main className={p.page} data-surface="light">
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>{d.studio.eyebrow}</p>
        <h1 className={`display d-lg ${p.title}`} style={{ whiteSpace: "pre-line" }}>{d.studio.title}</h1>
        <p className={p.lede}>{d.studio.text}</p>
      </div>

      <div className={p.body}>
        <div className={s.people} style={{ marginTop: 0 }}>
          {d.studio.people.map((person) => (
            <article key={person.name} className={s.person}>
              <h2 className={s.personName}>{person.name}</h2>
              <p className={s.personLine}>{person.line}</p>
              <p className={s.personFocus}>{person.focus}</p>
            </article>
          ))}
        </div>

        <section className={c.block} style={{ marginTop: "clamp(3rem, 8vh, 5rem)" }}>
          <p className={c.blockLabel}>{d.process.eyebrow}</p>
          <div>
            <h2 className="display d-sm" style={{ margin: "0 0 2rem" }}>{d.process.title}</h2>
            {d.process.steps.map((step) => (
              <div key={step.n} style={{ paddingBottom: "1.6rem", marginBottom: "1.6rem", borderBottom: "1px solid rgba(22,54,40,.09)" }}>
                <p className={c.blockLabel} style={{ marginBottom: ".5rem" }}>{step.n} — {step.name}</p>
                <p className={c.blockText} style={{ fontSize: "1rem" }}>{step.text}</p>
              </div>
            ))}
            <div style={{ marginTop: "1rem" }}><QuoteButton label={d.contact.cta} /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
