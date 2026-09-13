export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

export const isLocale = (v: string): v is Locale =>
  (LOCALES as readonly string[]).includes(v);

/** etichetta mostrata nel selettore di lingua */
export const LOCALE_LABEL: Record<Locale, string> = { it: "IT", en: "EN" };
