import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis: Lenis | null = null;
let registered = false;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

/** true sui dispositivi dove lo scrub di un video grande non reggerebbe */
export const isLightDevice = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 900 || isCoarsePointer() || navigator.hardwareConcurrency <= 4);

/**
 * Se ha senso bloccare la pagina per far scorrere qualcosa di lato.
 * Qui contano solo larghezza e tipo di puntatore: legare la scelta al numero
 * di core, come per il video, faceva ricadere sull'impaginato da telefono
 * anche portatili perfettamente capaci.
 */
export const canPinHorizontal = () =>
  typeof window !== "undefined" && window.innerWidth >= 1000 && !isCoarsePointer();

export function initScroll() {
  if (typeof window === "undefined") return null;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  if (lenis) return lenis;
  if (prefersReducedMotion()) return null;

  lenis = new Lenis({
    duration: 1.05,
    // scorrimento morbido ma non "gommoso": si deve poter leggere
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToId(id: string) {
  const el = document.querySelector(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function destroyScroll() {
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
