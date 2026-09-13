import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { PROJECTS } from "@/data/projects";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fico.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/services", "/studio"];
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${SITE}/${lang}${page}`,
        changeFrequency: page === "" ? "monthly" : "yearly",
        priority: page === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}${page}`])),
        },
      });
    }
    for (const project of PROJECTS) {
      entries.push({ url: `${SITE}/${lang}/work/${project.slug}`, priority: 0.6 });
    }
  }
  return entries;
}
