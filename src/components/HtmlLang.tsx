"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Il tag <html> vive nel layout radice, che è condiviso dalle due lingue:
 * qui si allinea l'attributo lang alla lingua effettiva della pagina.
 */
export default function HtmlLang({ lang }: { lang: Locale }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
