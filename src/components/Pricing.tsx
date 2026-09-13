"use client";

import { useRef } from "react";
import s from "./sections.module.css";
import { useReveal } from "@/lib/useReveal";
import { openAskFico } from "./AskFico";
import type { Dict } from "@/i18n/dictionaries";

export default function Pricing({ dict }: { dict: Dict }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const d = dict.pricing;

  return (
    <section ref={root} id="pricing" className={`${s.section} ${s.light}`} data-surface="light">
      <div className={s.inner}>
        <div className={s.head}>
          <p className="eyebrow reveal">{d.eyebrow}</p>
          <div className={s.priceGrid}>
            <div>
              <h2 className={`${s.priceBig} reveal`}>{d.title}</h2>
              <p className={`${s.priceText} reveal`}>{d.text}</p>
              <button className="btn btn--solid magnetic reveal" onClick={(e) => openAskFico(e.currentTarget)} data-cursor="open">
                {d.cta}
              </button>
            </div>
            <div className="reveal">
              <div className={s.block}>
                <p className={s.blockLabel}>{d.includedLabel}</p>
                <ul className={s.included}>
                  {d.included.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
              <div className={s.block}>
                <p className={s.blockLabel}>{d.extraLabel}</p>
                <p className={s.blockText}>{d.extra}</p>
              </div>
              <div className={s.block}>
                <p className={s.blockLabel}>{d.afterLabel}</p>
                <p className={s.blockText}>{d.after}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
