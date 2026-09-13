import type { Locale } from "@/i18n/config";

/**
 * ASK FICO — il questionario guidato.
 *
 * È tutto qui dentro: domande, risposte, diramazioni. Per cambiare una domanda
 * o aggiungerne una non si tocca nessun componente. Il percorso si adatta alle
 * risposte: chi vuole vendere online non si sente chiedere quante pagine
 * immagina, e chi ha solo una domanda non viene trascinato nel preventivo.
 */

export type L = Record<Locale, string>;
export type Answers = Record<string, string | string[]>;

export interface Option {
  id: string;
  label: L;
  /** salto specifico di questa risposta */
  next?: string;
}

export interface Group {
  field: string;
  label: L;
  options: Option[];
}

export interface Question {
  id: string;
  field?: string;
  kind: "single" | "multi" | "text" | "groups";
  title: L;
  lead?: L;
  hint?: L;
  options?: Option[];
  groups?: Group[];
  maxSelect?: number;
  optional?: boolean;
  placeholder?: L;
  next?: string | ((a: Answers) => string);
}

const t = (it: string, en: string): L => ({ it, en });

export const FIRST_QUESTION = "start";
export const SUMMARY = "__summary";

export const QUESTIONS: Question[] = [
  {
    id: "start",
    field: "projectType",
    kind: "single",
    title: t("Da dove partiamo?", "Where do we start?"),
    options: [
      { id: "new", label: t("Non ho ancora un sito", "I don't have a website yet"), next: "goal" },
      { id: "redesign", label: t("Ho già un sito ma voglio rifarlo", "I have a site but I want it rebuilt"), next: "improve" },
      { id: "sell", label: t("Voglio vendere online", "I want to sell online"), next: "sellWhat" },
      { id: "landing", label: t("Mi serve una landing page", "I need a landing page"), next: "landingPurpose" },
      { id: "unsure", label: t("Non so ancora cosa mi serve", "I'm not sure what I need yet"), next: "objective" },
      { id: "question", label: t("Ho solo una domanda", "I just have a question"), next: "freeQuestion" },
    ],
  },

  /* ---------------------------------------------------------- non ho un sito */
  {
    id: "goal",
    field: "goals",
    kind: "multi",
    maxSelect: 3,
    title: t("Cosa dovrebbe fare il tuo sito?", "What should your site do?"),
    hint: t("Puoi scegliere fino a tre risposte.", "You can pick up to three."),
    options: [
      { id: "present", label: t("Presentare la mia attività", "Present my business") },
      { id: "leads", label: t("Portarmi nuovi contatti", "Bring me new enquiries") },
      { id: "bookings", label: t("Ricevere richieste o prenotazioni", "Take enquiries or bookings") },
      { id: "portfolio", label: t("Mostrare i miei lavori", "Show my work") },
      { id: "products", label: t("Presentare prodotti o servizi", "Present products or services") },
      { id: "sell", label: t("Vendere online", "Sell online") },
      { id: "unknown", label: t("Non lo so ancora", "I don't know yet") },
    ],
    next: "business",
  },

  /* ------------------------------------------------------------- rifacimento */
  {
    id: "improve",
    field: "improve",
    kind: "multi",
    title: t("Cosa vorresti migliorare?", "What would you like to improve?"),
    options: [
      { id: "design", label: t("Il design", "The design") },
      { id: "mobile", label: t("La versione mobile", "The mobile version") },
      { id: "speed", label: t("La velocità", "The speed") },
      { id: "structure", label: t("La struttura", "The structure") },
      { id: "usability", label: t("La facilità di utilizzo", "How easy it is to use") },
      { id: "conversion", label: t("Le richieste che ricevo", "The enquiries it brings in") },
      { id: "everything", label: t("Praticamente tutto", "Pretty much everything") },
      { id: "unsure", label: t("Non sono sicuro", "I'm not sure") },
    ],
    next: "currentUrl",
  },
  {
    id: "currentUrl",
    field: "currentUrl",
    kind: "text",
    optional: true,
    title: t("Hai il link del sito attuale?", "Do you have the link to your current site?"),
    hint: t("Facoltativo, ma ci aiuta molto a darti una risposta precisa.", "Optional, but it helps us give you a precise answer."),
    placeholder: t("esempio.it", "example.com"),
    next: "business",
  },

  /* ------------------------------------------------------------- e-commerce */
  {
    id: "sellWhat",
    field: "sellWhat",
    kind: "single",
    title: t("Cosa vuoi vendere?", "What do you want to sell?"),
    options: [
      { id: "physical", label: t("Prodotti fisici", "Physical products") },
      { id: "digital", label: t("Prodotti digitali", "Digital products") },
      { id: "services", label: t("Servizi", "Services") },
      { id: "bookings", label: t("Prenotazioni", "Bookings") },
      { id: "subscriptions", label: t("Abbonamenti", "Subscriptions") },
      { id: "other", label: t("Altro", "Something else") },
    ],
    next: "productCount",
  },
  {
    id: "productCount",
    field: "productCount",
    kind: "single",
    title: t("Quanti prodotti, più o meno?", "Roughly how many products?"),
    options: [
      { id: "1-10", label: t("Da 1 a 10", "1 to 10") },
      { id: "10-50", label: t("Da 10 a 50", "10 to 50") },
      { id: "50-200", label: t("Da 50 a 200", "50 to 200") },
      { id: "200+", label: t("Più di 200", "More than 200") },
      { id: "unknown", label: t("Non lo so ancora", "I don't know yet") },
    ],
    next: "catalogue",
  },
  {
    id: "catalogue",
    field: "catalogue",
    kind: "single",
    title: t("Hai già un catalogo prodotti?", "Do you already have a product catalogue?"),
    hint: t("Anche un semplice foglio di calcolo con nomi, prezzi e foto.", "Even a simple spreadsheet with names, prices and photos."),
    options: [
      { id: "yes", label: t("Sì", "Yes") },
      { id: "partly", label: t("In parte", "Partly") },
      { id: "no", label: t("No", "No") },
    ],
    next: "business",
  },

  /* ----------------------------------------------------------- landing page */
  {
    id: "landingPurpose",
    field: "landingPurpose",
    kind: "single",
    title: t("A cosa servirà?", "What will it be for?"),
    options: [
      { id: "launch", label: t("Lanciare un prodotto", "Launching a product") },
      { id: "leads", label: t("Raccogliere contatti", "Collecting enquiries") },
      { id: "service", label: t("Promuovere un servizio", "Promoting a service") },
      { id: "campaign", label: t("Una campagna pubblicitaria", "An advertising campaign") },
      { id: "event", label: t("Un evento", "An event") },
      { id: "other", label: t("Altro", "Something else") },
    ],
    next: "business",
  },

  /* ---------------------------------------------------------------- non so */
  {
    id: "objective",
    field: "objective",
    kind: "single",
    lead: t("Perfetto. Partiamo dall'obiettivo.", "Perfect. Let's start from the goal."),
    title: t("Cosa vorresti ottenere online?", "What would you like to achieve online?"),
    options: [
      { id: "found", label: t("Farmi trovare meglio", "Be easier to find") },
      { id: "professional", label: t("Presentarmi in modo professionale", "Look professional") },
      { id: "leads", label: t("Ricevere più contatti", "Get more enquiries") },
      { id: "sell", label: t("Vendere", "Sell") },
      { id: "bookings", label: t("Ricevere prenotazioni", "Take bookings") },
      { id: "showcase", label: t("Mostrare il mio lavoro", "Show my work") },
      { id: "refresh", label: t("Rinnovare la mia immagine", "Refresh how I look") },
      { id: "unknown", label: t("Non lo so ancora", "I don't know yet") },
    ],
    next: "business",
  },

  /* ---------------------------------------------------------------- comune */
  {
    id: "business",
    field: "businessType",
    kind: "single",
    title: t("Che tipo di attività hai?", "What kind of business do you have?"),
    options: [
      { id: "local", label: t("Negozio o attività locale", "Shop or local business") },
      { id: "hospitality", label: t("Ristorante o hospitality", "Restaurant or hospitality") },
      { id: "professional", label: t("Professionista", "Independent professional") },
      { id: "company", label: t("Studio o società", "Practice or company") },
      { id: "brand", label: t("Brand", "Brand") },
      { id: "maker", label: t("Artigiano", "Maker or craftsperson") },
      { id: "startup", label: t("Startup", "Startup") },
      { id: "other", label: t("Altro", "Something else") },
    ],
    // una landing page è una pagina sola e un negozio si misura in prodotti:
    // in entrambi i casi la domanda sul numero di pagine non ha senso
    next: (a) => (a.projectType === "landing" || a.projectType === "sell" ? "materials" : "size"),
  },
  {
    id: "size",
    field: "pages",
    kind: "single",
    title: t("Quanto contenuto immagini?", "How much content do you imagine?"),
    hint: t("Una stima basta. Ci pensiamo noi a capire cosa serve davvero.", "A rough idea is enough — working out what you actually need is our job."),
    options: [
      { id: "one", label: t("Una pagina essenziale", "A single essential page") },
      { id: "3-5", label: t("Da 3 a 5 pagine", "3 to 5 pages") },
      { id: "6-10", label: t("Da 6 a 10 pagine", "6 to 10 pages") },
      { id: "10+", label: t("Più di 10 pagine", "More than 10 pages") },
      { id: "unknown", label: t("Non lo so ancora", "I don't know yet") },
    ],
    next: "materials",
  },
  {
    id: "materials",
    field: "materials",
    kind: "multi",
    title: t("Hai già i materiali?", "Do you already have the materials?"),
    hint: t("Seleziona tutto quello che hai.", "Select everything you have."),
    options: [
      { id: "logo", label: t("Logo", "Logo") },
      { id: "identity", label: t("Identità visiva", "Visual identity") },
      { id: "photos", label: t("Fotografie", "Photographs") },
      { id: "copy", label: t("Testi", "Written copy") },
      { id: "domain", label: t("Dominio", "Domain name") },
      { id: "hosting", label: t("Hosting", "Hosting") },
      { id: "nothing", label: t("Non ho ancora nulla", "Nothing yet") },
      { id: "unsure", label: t("Non so cosa serve", "I don't know what's needed") },
    ],
    next: "whenBudget",
  },
  {
    id: "whenBudget",
    kind: "groups",
    title: t("Tempi e budget", "Timing and budget"),
    hint: t("Servono solo a capire come impostare la proposta.", "These only help us shape the proposal."),
    groups: [
      {
        field: "timing",
        label: t("Quando vorresti essere online?", "When would you like to be live?"),
        options: [
          { id: "asap", label: t("Il prima possibile", "As soon as possible") },
          { id: "1m", label: t("Entro un mese", "Within a month") },
          { id: "2-3m", label: t("Entro due o tre mesi", "Within two or three months") },
          { id: "relaxed", label: t("Non ho fretta", "No rush") },
          { id: "unknown", label: t("Non lo so ancora", "I don't know yet") },
        ],
      },
      {
        field: "budget",
        label: t("Hai già un'idea di budget?", "Do you have a budget in mind?"),
        options: [
          { id: "400-700", label: t("400 – 700 €", "€400 – €700") },
          { id: "700-1500", label: t("700 – 1.500 €", "€700 – €1,500") },
          { id: "1500+", label: t("Oltre 1.500 €", "Over €1,500") },
          { id: "undefined", label: t("Non l'ho ancora definito", "Not defined yet") },
        ],
      },
    ],
    next: SUMMARY,
  },

  /* ------------------------------------------------------- solo una domanda */
  {
    id: "freeQuestion",
    field: "question",
    kind: "text",
    title: t("Scrivici pure.", "Go ahead, ask."),
    placeholder: t("La tua domanda", "Your question"),
    next: SUMMARY,
  },
];

export const byId = (id: string) => QUESTIONS.find((q) => q.id === id);

export function nextOf(q: Question, a: Answers, chosen?: Option): string {
  if (chosen?.next) return chosen.next;
  if (typeof q.next === "function") return q.next(a);
  return q.next ?? SUMMARY;
}

/** percorso completo con le risposte date finora: serve per l'indicatore 01/05 */
export function pathFor(a: Answers): string[] {
  const path: string[] = [];
  let id: string = FIRST_QUESTION;
  let guard = 0;
  while (id !== SUMMARY && guard++ < 20) {
    const q = byId(id);
    if (!q) break;
    path.push(id);
    const value = q.field ? a[q.field] : undefined;
    const chosen =
      q.kind === "single" && typeof value === "string"
        ? q.options?.find((o) => o.id === value)
        : undefined;
    if (value === undefined && !q.optional) break;
    id = nextOf(q, a, chosen);
  }
  return path;
}

/* ------------------------------------------------------------------ testi */

export const ASK_UI = {
  eyebrow: t("Ask FICO", "Ask FICO"),
  openTitle: t("Parlaci della tua idea.", "Tell us about your idea."),
  openText: t(
    "Ti facciamo qualche domanda. In pochi passaggi prepariamo una prima richiesta per il tuo progetto.",
    "We'll ask you a few questions. In a few steps we'll put together a first outline of your project.",
  ),
  begin: t("Cominciamo", "Let's begin"),
  back: t("Indietro", "Back"),
  close: t("Chiudi", "Close"),
  skip: t("Salta", "Skip"),
  next: t("Avanti", "Continue"),
  summaryTitle: t("Abbiamo capito.", "Here's what we understood."),
  summaryPrice: t(
    "Ogni progetto è diverso. Partiamo da 400 € e prepariamo un preventivo sulla base delle tue esigenze.",
    "Every project is different. We start from €400 and build a quote around what you need.",
  ),
  summaryCta: t("Richiedi il preventivo", "Request the quote"),
  contactTitle: t("Come ti ricontattiamo?", "How do we reach you?"),
  name: t("Nome", "Name"),
  company: t("Attività o azienda", "Business or company"),
  email: t("Email", "Email"),
  phone: t("Telefono", "Phone"),
  link: t("Instagram o sito", "Instagram or website"),
  optional: t("facoltativo", "optional"),
  note: t("C'è qualcosa che dovremmo sapere?", "Anything else we should know?"),
  privacy: t(
    "Ho letto l'informativa e acconsento al trattamento dei miei dati per essere ricontattato.",
    "I've read the privacy notice and agree to be contacted about my request.",
  ),
  privacyLink: t("Leggi l'informativa", "Read the privacy notice"),
  send: t("Invia la richiesta", "Send the request"),
  sending: t("Invio in corso…", "Sending…"),
  doneTitle: t("Ricevuto.", "Received."),
  doneText: t(
    "Cesare e Leonardo leggeranno personalmente la tua richiesta e ti ricontatteranno.",
    "Cesare and Leonardo will read your request personally and get back to you.",
  ),
  errorRequired: t("Servono nome ed email per poterti rispondere.", "We need a name and an email to reply to you."),
  errorPrivacy: t("Serve il consenso per poterti ricontattare.", "We need your consent before we can contact you."),
  errorSend: t("Qualcosa non ha funzionato.", "Something went wrong."),
  errorFallback: t(
    "L'invio automatico non è ancora attivo. Apri il programma di posta con la richiesta già compilata:",
    "Automatic sending isn't live yet. Open your mail app with the request already filled in:",
  ),
  openMail: t("Apri il programma di posta", "Open my mail app"),
  labels: {
    projectType: t("Progetto", "Project"),
    goals: t("Obiettivi", "Goals"),
    improve: t("Da migliorare", "To improve"),
    currentUrl: t("Sito attuale", "Current site"),
    sellWhat: t("Cosa vendi", "What you sell"),
    productCount: t("Prodotti", "Products"),
    catalogue: t("Catalogo", "Catalogue"),
    landingPurpose: t("Scopo", "Purpose"),
    objective: t("Obiettivo", "Goal"),
    businessType: t("Attività", "Business"),
    pages: t("Contenuti", "Content"),
    materials: t("Materiali", "Materials"),
    timing: t("Tempi", "Timing"),
    budget: t("Budget", "Budget"),
    question: t("Domanda", "Question"),
  } as Record<string, L>,
};

/** etichetta leggibile di una risposta, per il riepilogo e per l'email */
export function labelFor(field: string, value: string, locale: Locale): string {
  for (const q of QUESTIONS) {
    if (q.field === field) {
      const o = q.options?.find((x) => x.id === value);
      if (o) return o.label[locale];
    }
    for (const g of q.groups ?? []) {
      if (g.field === field) {
        const o = g.options.find((x) => x.id === value);
        if (o) return o.label[locale];
      }
    }
  }
  return value;
}

/* ------------------------------------------------- frammenti per la frase */

/*
  Le etichette dei pulsanti sono scritte per essere premute, non per finire
  dentro una frase: «Presentare la mia attività» diventa sgrammaticato dopo
  «soprattutto per». Qui ci sono le versioni pensate per il riepilogo.
*/

export const SENTENCE_BUSINESS: Record<string, L> = {
  local: t("un'attività locale", "a local business"),
  hospitality: t("un ristorante", "a restaurant"),
  professional: t("un professionista", "an independent professional"),
  company: t("uno studio", "a practice"),
  brand: t("un brand", "a brand"),
  maker: t("un artigiano", "a maker"),
  startup: t("una startup", "a startup"),
  other: t("un'attività", "a business"),
};

export const SENTENCE_GOALS: Record<string, L> = {
  present: t("presentare l'attività", "present the business"),
  leads: t("ricevere nuovi contatti", "bring in new enquiries"),
  bookings: t("raccogliere richieste e prenotazioni", "take enquiries and bookings"),
  portfolio: t("mostrare i lavori", "show the work"),
  products: t("presentare prodotti e servizi", "present products and services"),
  sell: t("vendere online", "sell online"),
  unknown: t("capire da dove partire", "work out where to start"),
};

export const SENTENCE_TYPE: Record<string, L> = {
  new: t("un sito nuovo", "a new website"),
  redesign: t("il rifacimento del tuo sito", "a rebuild of your site"),
  sell: t("un negozio online", "an online shop"),
  landing: t("una landing page", "a landing page"),
  unsure: t("il sito giusto per la tua attività", "the right site for your business"),
  question: t("una risposta", "an answer"),
};
