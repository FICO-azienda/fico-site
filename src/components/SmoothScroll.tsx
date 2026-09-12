"use client";

import { useEffect } from "react";
import { initScroll, destroyScroll } from "@/animations/scroll";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = initScroll();
    if (process.env.NODE_ENV !== "production") {
      // comodo per pilotare lo scorrimento da console durante le verifiche
      (window as unknown as { fico?: unknown }).fico = { lenis };
    }
    // il ripristino dello scroll al ricaricamento manderebbe il film a meta'
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => destroyScroll();
  }, []);
  return null;
}
