"use client";

import { useRef } from "react";
import styles from "./WhyFico.module.css";
import { useReveal } from "@/lib/useReveal";

const POINTS = [
  {
    word: "Direct",
    text: "You work with the people who design and build the site. No account layer, no brief passed down a chain.",
  },
  {
    word: "Tailored",
    text: "Every project starts from the business itself. Nothing is assembled from a theme or reused from the last client.",
  },
  {
    word: "Accessible",
    text: "A lean studio structure means work of this level is within reach of businesses that would never approach a large agency.",
  },
];

export default function WhyFico() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="why" className={styles.why} data-surface="light">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className="eyebrow reveal">Why FICO</p>
          <h2 className="display d-md reveal">
            Three reasons,
            <br />
            no brochure.
          </h2>
        </div>
        <div className={styles.grid}>
          {POINTS.map((p) => (
            <article key={p.word} className={`${styles.card} reveal`}>
              <h3 className={styles.word}>{p.word}</h3>
              <p className={styles.text}>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
