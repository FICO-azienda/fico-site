"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ClosingCta.module.css";
import { prefersReducedMotion, scrollToId } from "@/animations/scroll";
import { useReveal } from "@/lib/useReveal";

export default function ClosingCta() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLSpanElement>(null);
  const first = useRef<HTMLHeadingElement>(null);
  const second = useRef<HTMLHeadingElement>(null);
  useReveal(root);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set([first.current, second.current], { opacity: 1, position: "static" });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(second.current, { opacity: 0, yPercent: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.8}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.to(first.current, { opacity: 0, yPercent: -12, filter: "blur(6px)", duration: 1 }, 0.3)
        .to(second.current, { opacity: 1, yPercent: 0, duration: 1 }, 0.5)
        // il nero si apre in avorio: e' lo stesso colore in cui finisce il film
        .to(wash.current, { opacity: 1, duration: 1.1 }, 1.5)
        .to(second.current, { color: "#163628", duration: 0.9 }, 1.6);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="contact" className={styles.closing} data-surface="dark">
      <div ref={stage} className={styles.stage}>
        <span ref={wash} className={styles.wash} aria-hidden="true" />
        <h2 ref={first} className={`display d-xl ${styles.phrase}`}>
          Your business
          <br />
          already has
          <br />
          a story.
        </h2>
        <h2 ref={second} className={`display d-xl ${styles.phrase}`}>
          We give it
          <br />
          a digital world.
        </h2>
      </div>

      <div className={styles.outro} data-surface="light">
        <img className={`${styles.lockup} reveal`} src="/img/fico-lockup.png" alt="FICO" />
        <p className={`body-lg ${styles.line} reveal`}>
          Tell us about your business — what it makes, who it is for, where it is going.
          We will tell you honestly whether we are the right studio for it.
        </p>
        <div className={`${styles.actions} reveal`}>
          <a
            className="btn btn--solid"
            href="mailto:ficolc78@gmail.com?subject=Start%20a%20project"
            data-cursor="open"
          >
            Start a project
          </a>
          <a
            className="btn"
            href="#studio"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("#studio");
            }}
            data-cursor="explore"
          >
            Contact us
          </a>
        </div>
        <a className={`link ${styles.mail} reveal`} href="mailto:ficolc78@gmail.com" data-cursor="open">
          ficolc78@gmail.com
        </a>
      </div>
    </section>
  );
}
