import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import Loader from "@/components/Loader";
import FilmExperience from "@/components/FilmExperience";
import Services from "@/components/Services";
import Styles from "@/components/Styles";
import Worlds from "@/components/Worlds";
import WorkGallery from "@/components/WorkGallery";
import Approach from "@/components/Approach";
import Pricing from "@/components/Pricing";
import Team from "@/components/Team";
import Faq from "@/components/Faq";
import ClosingCta from "@/components/ClosingCta";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);

  return (
    <>
      <Loader />
      <main id="top">
      <h1 className="sr-only">{dict.hero.title}</h1>
      <FilmExperience dict={dict} />
      <Services dict={dict} />
      <Styles locale={lang} dict={dict} />
      <Worlds dict={dict} />
      <WorkGallery locale={lang} dict={dict} />
      <Approach dict={dict} />
      <Pricing dict={dict} />
      <Team dict={dict} />
      <Faq dict={dict} />
      <ClosingCta dict={dict} />
      </main>
    </>
  );
}
