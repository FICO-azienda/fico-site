"use client";

import { useRef } from "react";
import styles from "./Studio.module.css";
import { useReveal } from "@/lib/useReveal";

export default function Studio() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="studio" className={styles.studio} data-surface="light">
      <div className={styles.lead}>
        <div className={styles.heading}>
          <p className={`eyebrow ${styles.label} reveal`}>FICO</p>
          <h2 className={`display d-lg ${styles.title} reveal`}>
            Digital experiences
            <br />
            for <em>real businesses.</em>
          </h2>
        </div>

        <div className={styles.tail}>
          <div />
          <div className={styles.copy}>
            <p className={`${styles.lede} reveal`}>
              We design and develop digital experiences that translate the identity of a
              business into a distinctive online presence.
            </p>
            <p className="body reveal">
              Every project begins with what a business already is — its materials, its
              language, the way it makes people feel in person — and carries that into a
              site built line by line around it.
            </p>
            <div className={`${styles.meta} reveal`}>
              <span>
                <span className={`eyebrow k`}>Based in</span>
                Italy, working everywhere
              </span>
              <span>
                <span className={`eyebrow k`}>Disciplines</span>
                Design, development, motion
              </span>
              <span>
                <span className={`eyebrow k`}>Engagement</span>
                Direct with the studio
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
