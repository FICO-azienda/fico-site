"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AskFico.module.css";
import {
  ASK_UI,
  FIRST_QUESTION,
  QUESTIONS,
  SUMMARY,
  byId,
  labelFor,
  nextOf,
  SENTENCE_BUSINESS,
  SENTENCE_GOALS,
  SENTENCE_TYPE,
  pathFor,
  type Answers,
  type Option,
} from "@/data/askFico";
import type { Locale } from "@/i18n/config";
import { getLenis } from "@/animations/scroll";

type Phase = "questions" | "summary" | "contact" | "done";

interface Contact {
  name: string;
  company: string;
  email: string;
  phone: string;
  link: string;
  note: string;
}

const EMPTY: Contact = { name: "", company: "", email: "", phone: "", link: "", note: "" };

/*
  Le risposte restano nella sessione del browser. Chi chiude per sbaglio, o
  ricarica, non ricomincia da capo: quattro domande buttate sono una richiesta
  persa. Si svuota appena la richiesta parte davvero.
*/
const SAVE_KEY = "fico.ask.v1";

interface Saved {
  current: string;
  history: string[];
  answers: Answers;
  phase: Phase;
  contact: Contact;
}

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Saved;
    // "done" non si ripristina: la richiesta di prima e' gia' partita
    return v.phase === "done" ? null : v;
  } catch {
    return null;
  }
}

export default function AskFico({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>(FIRST_QUESTION);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("questions");
  const [contact, setContact] = useState<Contact>(EMPTY);
  const [consent, setConsent] = useState(false);
  /* campo invisibile: le persone non lo vedono, i robot lo riempiono */
  const [trapField, setTrapField] = useState("");
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const T = (v: { it: string; en: string }) => v[locale];

  /* ------------------------------------------------------------- apertura */
  const openAsk = useCallback((e: Event) => {
    /*
      Il pulsante arriva insieme all'evento invece di essere dedotto da
      document.activeElement: Safari non dà il focus ai pulsanti quando li si
      clicca col mouse, quindi altrimenti alla chiusura il focus non avrebbe
      dove tornare.
    */
    const from = (e as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, []);
  const closeAsk = useCallback(() => {
    setOpen(false);
    // il focus torna dove stava, ma dopo che la sovrapposizione si è ritirata:
    // affidarlo alla pulizia dell'effetto lo faceva scattare troppo presto
    const back = opener.current;
    window.setTimeout(() => back?.focus?.({ preventScroll: true }), 60);
  }, []);

  useEffect(() => {
    window.addEventListener("fico:ask-open", openAsk);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAsk();
    };
    window.addEventListener("keydown", onKey);
    const saved = load();
    if (saved) {
      setCurrent(saved.current);
      setHistory(saved.history);
      setAnswers(saved.answers);
      setPhase(saved.phase);
      setContact(saved.contact);
    }
    setRestored(true);

    // link diretto per le campagne: /?preventivo
    if (new URLSearchParams(window.location.search).has("preventivo")) setOpen(true);
    return () => {
      window.removeEventListener("fico:ask-open", openAsk);
      window.removeEventListener("keydown", onKey);
    };
  }, [openAsk, closeAsk]);

  useEffect(() => {
    const lenis = getLenis();
    document.body.classList.toggle("is-locked", open);
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  /*
    Trappola per il focus. Senza, con la sovrapposizione aperta il tasto Tab
    porta dietro la pagina — su elementi che non si vedono — e chi naviga da
    tastiera si perde. Alla chiusura il focus torna al pulsante di partenza.
  */
  useEffect(() => {
    const root = overlay.current;
    if (!open || !root) return;

    const focusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])',
        ),
      ).filter((el) => el.offsetParent !== null);

    // un fotogramma di attesa: all'istante dell'apertura la sovrapposizione è
    // ancora nascosta, e focus() su un elemento invisibile non ha alcun effetto
    const enter = requestAnimationFrame(() => {
      const first = focusable()[0];
      (first ?? root).focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusable();
      if (!list.length) return;
      const head = list[0];
      const tail = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) {
        e.preventDefault();
        head.focus();
      } else if (e.shiftKey && active === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && active === tail) {
        e.preventDefault();
        head.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(enter);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* a ogni passaggio il focus torna in cima alla domanda nuova */
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>("h2")?.focus?.({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [current, phase, open]);

  useEffect(() => {
    if (!restored) return;
    try {
      if (phase === "done") sessionStorage.removeItem(SAVE_KEY);
      else sessionStorage.setItem(SAVE_KEY, JSON.stringify({ current, history, answers, phase, contact }));
    } catch {
      // navigazione privata o spazio esaurito: si prosegue senza salvare
    }
  }, [restored, current, history, answers, phase, contact]);

  /* ------------------------------------------------------- avanzamento */
  const path = useMemo(() => pathFor(answers), [answers]);
  const total = Math.max(path.length, 4);
  const index = Math.max(0, path.indexOf(current)) + 1;

  const q = byId(current);

  const goNext = (target: string) => {
    setHistory((h) => [...h, current]);
    if (target === SUMMARY) {
      // chi aveva solo una domanda non merita un riepilogo del progetto
      setPhase(answers.projectType === "question" ? "contact" : "summary");
    } else {
      setCurrent(target);
    }
    panel.current?.scrollIntoView({ block: "nearest" });
  };

  const goBack = () => {
    if (phase === "done") return;
    if (phase === "contact" && answers.projectType !== "question") return setPhase("summary");
    if (phase === "summary" || phase === "contact") {
      setPhase("questions");
      return;
    }
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setCurrent(prev);
  };

  const pick = (opt: Option) => {
    if (!q?.field) return;
    const updated = { ...answers, [q.field]: opt.id };
    setAnswers(updated);
    window.setTimeout(() => goNext(nextOf(q, updated, opt)), 180);
  };

  const toggle = (opt: Option) => {
    if (!q?.field) return;
    const prev = (answers[q.field] as string[]) ?? [];
    const on = prev.includes(opt.id);
    let list = on ? prev.filter((v) => v !== opt.id) : [...prev, opt.id];
    if (q.maxSelect && list.length > q.maxSelect) list = list.slice(1);
    setAnswers({ ...answers, [q.field]: list });
  };

  const pickGroup = (field: string, opt: Option) =>
    setAnswers((a) => ({ ...a, [field]: opt.id }));

  const groupsDone = q?.groups?.every((g) => answers[g.field]) ?? false;

  /* --------------------------------------------------------- riepilogo */
  const recap = useMemo(() => {
    const out: { key: string; value: string }[] = [];
    for (const [field, value] of Object.entries(answers)) {
      if (!value || (Array.isArray(value) && !value.length)) continue;
      const label = ASK_UI.labels[field];
      if (!label) continue;
      const text = Array.isArray(value)
        ? value.map((v) => labelFor(field, v, locale)).join(" · ")
        : labelFor(field, value, locale);
      out.push({ key: T(label), value: text });
    }
    return out;
  }, [answers, locale]);

  const sentence = useMemo(() => {
    const type = (answers.projectType as string) ?? "new";
    const what = SENTENCE_TYPE[type]?.[locale] ?? SENTENCE_TYPE.new[locale];
    const bizId = answers.businessType as string | undefined;
    const biz = bizId ? SENTENCE_BUSINESS[bizId]?.[locale] : undefined;
    const goals = ((answers.goals as string[]) ?? [])
      .map((g) => SENTENCE_GOALS[g]?.[locale])
      .filter(Boolean);

    const join = (list: string[]) =>
      list.length < 2 ? list[0] : `${list.slice(0, -1).join(", ")} ${locale === "en" ? "and" : "e"} ${list.at(-1)}`;

    if (locale === "en") {
      return [
        `You're looking for ${what}`,
        biz ? ` for ${biz}` : "",
        goals.length ? `, mainly to ${join(goals)}` : "",
        ".",
      ].join("");
    }
    return [
      `Stai cercando ${what}`,
      biz ? ` per ${biz}` : "",
      goals.length ? `, soprattutto per ${join(goals)}` : "",
      ".",
    ].join("");
  }, [answers, locale]);

  /* ------------------------------------------------------------- invio */
  const mailtoHref = () => {
    const lines = recap.map((r) => `${r.key}: ${r.value}`);
    const body = [
      sentence,
      "",
      ...lines,
      "",
      `${T(ASK_UI.name)}: ${contact.name}`,
      `${T(ASK_UI.company)}: ${contact.company}`,
      `${T(ASK_UI.email)}: ${contact.email}`,
      contact.phone && `${T(ASK_UI.phone)}: ${contact.phone}`,
      contact.link && `${T(ASK_UI.link)}: ${contact.link}`,
      contact.note && `\n${contact.note}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:ficolc78@gmail.com?subject=${encodeURIComponent("FICO — richiesta di preventivo")}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFallback(null);
    if (!contact.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) {
      return setError(T(ASK_UI.errorRequired));
    }
    if (!consent) return setError(T(ASK_UI.errorPrivacy));

    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, brief: answers, summary: sentence, contact, website: trapField }),
      });
      if (res.ok) setPhase("done");
      else setFallback(T(ASK_UI.errorFallback));
    } catch {
      setFallback(T(ASK_UI.errorFallback));
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------------------------------------ rendering */
  const showStep = phase === "questions" && q;

  return (
    <div
      ref={overlay}
      className={styles.overlay}
      data-lenis-prevent
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="Ask FICO"
      tabIndex={-1}
    >
      <div className={styles.bar}>
        <span className={styles.eyebrow}>{T(ASK_UI.eyebrow)}</span>
        {(history.length > 0 || phase !== "questions") && phase !== "done" && (
          <button className={styles.barBtn} onClick={goBack}>{T(ASK_UI.back)}</button>
        )}
        {showStep && (
          <span className={styles.step}>
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        )}
        <button
          className={styles.barBtn}
          onClick={closeAsk}
          style={{ marginLeft: showStep || phase !== "questions" ? "1.5rem" : "auto" }}
        >
          {T(ASK_UI.close)}
        </button>
      </div>

      <div className={styles.stage}>
        <div className={styles.panel} ref={panel}>
          {/* ------------------------------------------------------ domande */}
          {showStep && (
            <div className={styles.fade} key={current}>
              {q.lead && <p className={styles.lead}>{T(q.lead)}</p>}
              <h2 className={styles.question} tabIndex={-1}>{T(q.title)}</h2>
              {q.hint && <p className={styles.hint}>{T(q.hint)}</p>}

              {q.kind === "single" && (
                <div className={styles.options}>
                  {q.options?.map((o) => (
                    <button key={o.id} className={styles.option} onClick={() => pick(o)}>
                      <span className={styles.mark} aria-hidden="true" />
                      {T(o.label)}
                    </button>
                  ))}
                </div>
              )}

              {q.kind === "multi" && (
                <>
                  <div className={styles.options}>
                    {q.options?.map((o) => {
                      const on = ((answers[q.field!] as string[]) ?? []).includes(o.id);
                      return (
                        <button
                          key={o.id}
                          className={styles.option}
                          data-on={on}
                          aria-pressed={on}
                          onClick={() => toggle(o)}
                        >
                          <span className={styles.mark} aria-hidden="true" />
                          {T(o.label)}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn--solid"
                    style={{ marginTop: "2rem" }}
                    disabled={!((answers[q.field!] as string[]) ?? []).length}
                    onClick={() => goNext(nextOf(q, answers))}
                  >
                    {T(ASK_UI.next)}
                  </button>
                </>
              )}

              {q.kind === "text" && (
                <>
                  <div className={styles.field}>
                    <input
                      type="text"
                      placeholder=" "
                      value={(answers[q.field!] as string) ?? ""}
                      onChange={(e) => setAnswers({ ...answers, [q.field!]: e.target.value })}
                    />
                    <label>{q.placeholder ? T(q.placeholder) : ""}</label>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1.4rem", flexWrap: "wrap" }}>
                    <button className="btn btn--solid" onClick={() => goNext(nextOf(q, answers))}>
                      {T(ASK_UI.next)}
                    </button>
                    {q.optional && (
                      <button className={styles.barBtn} onClick={() => goNext(nextOf(q, answers))}>
                        {T(ASK_UI.skip)}
                      </button>
                    )}
                  </div>
                </>
              )}

              {q.kind === "groups" && (
                <>
                  {q.groups?.map((g) => (
                    <div key={g.field}>
                      <p className={styles.groupLabel}>{T(g.label)}</p>
                      <div className={styles.options}>
                        {g.options.map((o) => (
                          <button
                            key={o.id}
                            className={styles.option}
                            data-on={answers[g.field] === o.id}
                            onClick={() => pickGroup(g.field, o)}
                          >
                            <span className={styles.mark} aria-hidden="true" />
                            {T(o.label)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn--solid"
                    style={{ marginTop: "2rem" }}
                    disabled={!groupsDone}
                    onClick={() => goNext(SUMMARY)}
                  >
                    {T(ASK_UI.next)}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- riepilogo */}
          {phase === "summary" && (
            <div className={styles.fade}>
              <h2 className={styles.question} tabIndex={-1}>{T(ASK_UI.summaryTitle)}</h2>
              <p className={styles.sentence}>{sentence}</p>
              <div className={styles.recap}>
                {recap.map((r) => (
                  <div className={styles.recapRow} key={r.key}>
                    <span className={styles.recapKey}>{r.key}</span>
                    <span>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className={styles.price}>{T(ASK_UI.summaryPrice)}</p>
              <button className="btn btn--solid" onClick={() => setPhase("contact")}>
                {T(ASK_UI.summaryCta)}
              </button>
            </div>
          )}

          {/* ------------------------------------------------------ contatti */}
          {phase === "contact" && (
            <form className={styles.fade} onSubmit={submit}>
              <h2 className={styles.question} tabIndex={-1}>{T(ASK_UI.contactTitle)}</h2>
              {error && <p className={styles.error}>{error}</p>}
              {fallback && (
                <p className={styles.error}>
                  {fallback}{" "}
                  <a href={mailtoHref()}>{T(ASK_UI.openMail)}</a>
                </p>
              )}

              {/* trappola per i robot: fuori dal flusso e invisibile a chi legge */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor="fico-website">Website</label>
                <input
                  id="fico-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trapField}
                  onChange={(e) => setTrapField(e.target.value)}
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <input type="text" placeholder=" " autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                  <label>{T(ASK_UI.name)}</label>
                </div>
                <div className={styles.field}>
                  <input type="text" placeholder=" " autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
                  <label>{T(ASK_UI.company)}</label>
                </div>
                <div className={styles.field}>
                  <input type="email" placeholder=" " autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  <label>{T(ASK_UI.email)}</label>
                </div>
                <div className={styles.field}>
                  <input type="tel" placeholder=" " autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                  <label>{T(ASK_UI.phone)} <span style={{ opacity: 0.6 }}>({T(ASK_UI.optional)})</span></label>
                </div>
              </div>

              <div className={styles.field}>
                <input type="text" placeholder=" " value={contact.link} onChange={(e) => setContact({ ...contact, link: e.target.value })} />
                <label>{T(ASK_UI.link)} <span style={{ opacity: 0.6 }}>({T(ASK_UI.optional)})</span></label>
              </div>

              <div className={styles.field}>
                <textarea rows={3} placeholder=" " value={contact.note} onChange={(e) => setContact({ ...contact, note: e.target.value })} />
                <label>{T(ASK_UI.note)}</label>
              </div>

              <label className={styles.consent}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span className={styles.box} aria-hidden="true" />
                <span>
                  {T(ASK_UI.privacy)}{" "}
                  <a href={`/${locale}/privacy`} target="_blank" rel="noreferrer">{T(ASK_UI.privacyLink)}</a>
                </span>
              </label>

              <button className="btn btn--solid" type="submit" disabled={busy}>
                {busy ? T(ASK_UI.sending) : T(ASK_UI.send)}
              </button>
            </form>
          )}

          {/* --------------------------------------------------------- fatto */}
          {phase === "done" && (
            <div className={`${styles.fade} ${styles.done}`}>
              <h2 className={styles.question} tabIndex={-1}>{T(ASK_UI.doneTitle)}</h2>
              <p className={styles.sentence}>{T(ASK_UI.doneText)}</p>
              <button className="btn" style={{ marginTop: "2rem" }} onClick={closeAsk}>
                {T(ASK_UI.close)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const openAskFico = (trigger?: HTMLElement) =>
  window.dispatchEvent(new CustomEvent("fico:ask-open", { detail: { trigger } }));
