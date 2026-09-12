"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/animations/scroll";

/**
 * Ingresso sobrio degli elementi marcati .reveal dentro un contenitore:
 * niente rimbalzi, solo una salita breve con dissolvenza.
 */
export function useReveal(root: RefObject<HTMLElement | null>, selector = ".reveal") {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll(selector), { opacity: 1, y: 0 });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((node) => {
        gsap.to(node, {
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 86%", once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [root, selector]);
}
