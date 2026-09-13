import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AskFico from "@/components/AskFico";
import HtmlLang from "@/components/HtmlLang";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fico.studio";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return {
    metadataBase: new URL(SITE),
    title: { default: d.meta.title, template: "%s — FICO" },
    description: d.meta.description,
    alternates: {
      canonical: `${SITE}/${lang}`,
      languages: { it: `${SITE}/it`, en: `${SITE}/en`, "x-default": `${SITE}/it` },
    },
    openGraph: {
      type: "website",
      url: `${SITE}/${lang}`,
      title: d.meta.title,
      description: d.meta.description,
      locale: lang === "it" ? "it_IT" : "en_GB",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "FICO" }],
    },
    twitter: { card: "summary_large_image", title: d.meta.title, description: d.meta.description, images: ["/og.jpg"] },
  };
}

const schema = (lang: Locale, description: string) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FICO",
  description,
  slogan: "Websites for a brighter tomorrow",
  url: `${SITE}/${lang}`,
  email: "ficolc78@gmail.com",
  founder: [
    { "@type": "Person", name: "Cesare Cicogna" },
    { "@type": "Person", name: "Leonardo Fiore" },
  ],
  knowsAbout: ["Web design", "Web development", "E-commerce", "Digital identity"],
  offers: {
    "@type": "Offer",
    priceCurrency: "EUR",
    price: "400",
    description: lang === "it" ? "I progetti partono da 400 €" : "Projects start from €400",
  },
});

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <HtmlLang lang={lang} />
      <SmoothScroll />
      <Cursor />
      <Navigation locale={lang} dict={d} />
      {children}
      <Footer locale={lang} dict={d} />
      <AskFico locale={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema(lang, d.meta.description)) }}
      />
    </>
  );
}
