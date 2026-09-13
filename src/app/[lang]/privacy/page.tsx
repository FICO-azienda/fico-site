import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LOCALES, isLocale } from "@/i18n/config";
import p from "@/components/PageHead.module.css";
import c from "@/components/CaseStudy.module.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "en" ? "Privacy notice" : "Informativa privacy",
    robots: { index: false },
  };
}

/**
 * Bozza. Descrive ciò che il sito fa davvero oggi — nessun tracciamento, un
 * solo modulo — e lascia scoperti i dati che FICO non ha ancora (denominazione,
 * partita IVA, sede). Va fatta verificare da un professionista prima di
 * considerarla conforme: qui non si finge che lo sia.
 */
const IT = {
  title: "Informativa privacy",
  draft:
    "Questa è una bozza redatta sulla base di come funziona il sito oggi. Prima della pubblicazione definitiva va verificata da un professionista, e vanno inseriti i dati identificativi dello studio, che al momento non sono ancora disponibili.",
  blocks: [
    { h: "Chi tratta i dati", t: "FICO, studio di design e sviluppo web di Cesare Cicogna e Leonardo Fiore. Denominazione legale, forma giuridica, partita IVA e sede sono da inserire non appena disponibili. Per qualsiasi richiesta: ficolc78@gmail.com." },
    { h: "Quali dati raccogliamo", t: "Soltanto quelli che inserisci volontariamente nel modulo di richiesta: nome, nome dell'attività, indirizzo email e, se scegli di indicarli, numero di telefono, sito o profilo social e il testo della tua richiesta. Nessun altro dato viene raccolto." },
    { h: "Perché li usiamo", t: "Unicamente per risponderti e per preparare la proposta che hai richiesto. Non inviamo comunicazioni commerciali, non cediamo i dati a terzi e non li usiamo per profilazione." },
    { h: "Per quanto tempo", t: "Conserviamo la richiesta per il tempo necessario a gestirla e, se il progetto non prosegue, non oltre ventiquattro mesi. Puoi chiederne la cancellazione in qualsiasi momento scrivendo all'indirizzo qui sopra." },
    { h: "A chi vengono comunicati", t: "Le email di richiesta e di conferma vengono recapitate tramite un servizio di invio esterno, che le tratta per nostro conto al solo scopo della consegna. Il sito è ospitato su un'infrastruttura di terze parti che registra i normali dati tecnici di accesso ai propri server." },
    { h: "Cookie e tracciamento", t: "Questo sito non installa cookie di profilazione e non utilizza strumenti di analisi o di tracciamento pubblicitario. Per questo non compare alcun banner di consenso: non c'è nulla da consentire oltre al funzionamento tecnico delle pagine." },
    { h: "I tuoi diritti", t: "Puoi chiedere in ogni momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento o opporti ad esso, e puoi revocare il consenso che hai prestato. È sufficiente scrivere a ficolc78@gmail.com. Hai inoltre diritto di rivolgerti al Garante per la protezione dei dati personali." },
  ],
};

const EN = {
  title: "Privacy notice",
  draft:
    "This is a draft based on how the site actually works today. Before final publication it must be reviewed by a qualified professional, and the studio's legal details — which are not yet available — must be added.",
  blocks: [
    { h: "Who handles your data", t: "FICO, a web design and development studio run by Cesare Cicogna and Leonardo Fiore. Legal name, company form, VAT number and registered address are to be added as soon as they exist. For any request: ficolc78@gmail.com." },
    { h: "What we collect", t: "Only what you enter yourself in the request form: your name, your business name, your email address and, if you choose to give them, your phone number, website or social profile, and the text of your request. Nothing else is collected." },
    { h: "Why we use it", t: "Solely to reply to you and to prepare the proposal you asked for. We send no marketing, we do not pass your data to third parties, and we do not use it for profiling." },
    { h: "How long we keep it", t: "We keep your request for as long as it takes to handle it and, if the project does not go ahead, no longer than twenty-four months. You can ask us to delete it at any time at the address above." },
    { h: "Who it is shared with", t: "The request and confirmation emails are delivered through an external sending service, which processes them on our behalf for delivery only. The site is hosted on third-party infrastructure that records the usual technical access logs on its own servers." },
    { h: "Cookies and tracking", t: "This site sets no profiling cookies and uses no analytics or advertising trackers. That is why there is no consent banner: there is nothing to consent to beyond the pages working." },
    { h: "Your rights", t: "You can ask at any time to access your data, correct it, delete it, restrict or object to its processing, and you can withdraw the consent you gave. Just write to ficolc78@gmail.com. You also have the right to lodge a complaint with your data protection authority." },
  ],
};

export default async function Privacy({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = lang === "en" ? EN : IT;

  return (
    <main className={p.page} data-surface="light">
      <div className={p.head}>
        <p className={`eyebrow ${p.eyebrowRow}`}>FICO</p>
        <h1 className={`display d-lg ${p.title}`}>{d.title}</h1>
        <p
          className={p.lede}
          style={{
            marginTop: "2.2rem",
            padding: "1rem 1.2rem",
            borderLeft: "2px solid var(--green-mid)",
            background: "rgba(22,54,40,.05)",
            fontSize: "0.92rem",
          }}
        >
          {d.draft}
        </p>
      </div>

      <div className={p.body}>
        {d.blocks.map((b) => (
          <section className={c.block} key={b.h}>
            <p className={c.blockLabel}>{b.h}</p>
            <p className={c.blockText}>{b.t}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
