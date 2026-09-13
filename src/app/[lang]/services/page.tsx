import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import p from "@/components/PageHead.module.css";
import c from "@/components/CaseStudy.module.css";
import QuoteButton from "@/components/QuoteButton";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return { title: d.nav.services, description: d.services.intro };
}

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <main className={p.page} data-surface="light">
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>{d.services.eyebrow}</p>
        <h1 className={`display d-lg ${p.title}`}>{d.services.title}</h1>
        <p className={p.lede}>{d.services.intro}</p>
      </div>

      <div className={p.body}>
        {d.services.items.map((item) => (
          <section className={c.block} key={item.n}>
            <p className={c.blockLabel}>{item.n}</p>
            <div>
              <h2 className="display d-sm" style={{ margin: "0 0 1rem" }}>{item.name}</h2>
              <p className={c.blockText}>{item.text}</p>
              <p className={c.blockText} style={{ marginTop: "1rem", color: "var(--on-light-faint)", fontSize: "0.95rem" }}>
                {item.who}
              </p>
            </div>
          </section>
        ))}

        <section className={c.block}>
          <p className={c.blockLabel}>{d.pricing.eyebrow}</p>
          <div>
            <h2 className="display d-sm" style={{ margin: "0 0 1rem" }}>{d.pricing.title}</h2>
            <p className={c.blockText}>{d.pricing.text}</p>
            <div style={{ marginTop: "2rem" }}><QuoteButton label={d.pricing.cta} /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
