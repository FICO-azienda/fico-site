import type { Locale } from "./config";

/**
 * Tutti i testi del sito, nelle due lingue.
 * Un file solo: per correggere una frase non serve cercarla fra i componenti.
 */

export interface Dict {
  meta: { title: string; description: string };
  nav: { work: string; services: string; studio: string; quote: string; menu: string; close: string; sound: string; soundOn: string };
  hero: { eyebrow: string; title: string; sub: string; ctaPrimary: string; ctaSecondary: string; scroll: string; skip: string };
  film: { chapters: string[][] };
  services: { eyebrow: string; title: string; intro: string; items: { n: string; name: string; text: string; who: string }[] };
  sectors: { eyebrow: string; title: string; note: string; items: string[] };
  work: { eyebrow: string; title: string; intro: string; all: string; visit: string; challenge: string; idea: string; design: string; build: string; scope: string; sector: string; year: string };
  process: { eyebrow: string; title: string; phrase1: string; phrase2: string; steps: { n: string; name: string; text: string }[] };
  pricing: { eyebrow: string; title: string; text: string; includedLabel: string; included: string[]; extraLabel: string; extra: string; afterLabel: string; after: string; cta: string };
  studio: { eyebrow: string; title: string; text: string; people: { name: string; line: string; focus: string }[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  contact: { eyebrow: string; title: string; sub: string; cta: string; or: string; phrase1: string; phrase2: string };
  footer: { tagline: string; privacy: string; rights: string };
}

const it: Dict = {
  meta: {
    title: "FICO — Progettiamo e sviluppiamo siti web per le aziende",
    description:
      "FICO è uno studio di design e sviluppo web. Progettiamo siti vetrina, siti dinamici ed e-commerce su misura per le aziende. I progetti partono da 400 €.",
  },
  nav: { work: "Lavori", services: "Servizi", studio: "Studio", quote: "Richiedi un preventivo", menu: "Menu", close: "Chiudi", sound: "Audio", soundOn: "Audio attivo" },
  hero: {
    eyebrow: "FICO — Studio di design e sviluppo web",
    title: "Progettiamo e sviluppiamo siti web per le aziende.",
    sub: "Design, sviluppo ed esperienze digitali su misura per la tua attività.",
    ctaPrimary: "Richiedi un preventivo",
    ctaSecondary: "Guarda i lavori",
    scroll: "Scorri",
    skip: "Salta il film",
  },
  film: {
    chapters: [
      ["Websites for a brighter tomorrow"],
      ["Ogni attività", "è un mondo."],
      ["Costruito", "dalla tua identità."],
      ["Pensato per", "il mondo digitale."],
      ["Su misura,", "non su modello."],
      ["Design. Sviluppo. Esperienza."],
      ["Trasformiamo le attività", "in esperienze digitali."],
    ],
  },
  services: {
    eyebrow: "Cosa costruiamo",
    title: "Tre modi di stare online.",
    intro: "Quello giusto dipende da cosa deve fare il tuo sito.",
    items: [
      {
        n: "01",
        name: "Sito vetrina",
        text: "La presenza online della tua attività: fino a cinque pagine, una struttura chiara e testi che si leggono. Si apre in fretta anche da telefono, e chi ti cerca capisce subito cosa fai.",
        who: "Attività locali, ristoranti, professionisti, artigiani, portfolio.",
      },
      {
        n: "02",
        name: "Sito dinamico",
        text: "Quando i contenuti cambiano spesso. Un pannello ti permette di aggiornare pagine, novità, progetti o cataloghi da solo, senza toccare il codice e senza doverci chiamare.",
        who: "Chi pubblica novità, gestisce un catalogo, raccoglie richieste o prenotazioni.",
      },
      {
        n: "03",
        name: "E-commerce",
        text: "Quando vendi online. Catalogo, schede prodotto, carrello, pagamenti e gestione degli ordini, costruiti intorno alla decisione di acquisto e non intorno al software.",
        who: "Chi vende prodotti o servizi anche fuori dal negozio.",
      },
    ],
  },
  sectors: {
    eyebrow: "Per chi",
    title: "I mondi in cui lavoriamo.",
    note: "Sono i settori in cui possiamo lavorare, non un elenco di clienti.",
    items: ["Ospitalità", "Moda", "Retail", "Automotive", "Studi professionali", "Food", "Lusso", "Attività locali"],
  },
  work: {
    eyebrow: "Lavori",
    title: "Un progetto alla volta, fatto bene.",
    intro: "",
    all: "Tutti i lavori",
    visit: "Visita il sito",
    challenge: "La sfida",
    idea: "L'idea",
    design: "Design",
    build: "Sviluppo",
    scope: "Cosa abbiamo fatto",
    sector: "Settore",
    year: "Anno",
  },
  process: {
    eyebrow: "Come lavoriamo",
    title: "Sei passaggi, dalla prima chiamata alla messa online.",
    phrase1: "Non solo\nun sito.",
    phrase2: "Un'esperienza\ndigitale.",
    steps: [
      { n: "01", name: "Ascolto", text: "Partiamo dalla tua attività: cosa vendi, chi decide, cosa ti frena adesso. Un'ora di conversazione vale più di dieci pagine di documento." },
      { n: "02", name: "Direzione", text: "Definiamo le pagine, l'ordine dei messaggi e le funzioni che servono. Prima la struttura e le parole, poi la grafica: mai il contrario." },
      { n: "03", name: "Design", text: "Ti mostriamo il sito prima che esista. Lo rivediamo insieme finché non è esattamente quello che serve." },
      { n: "04", name: "Sviluppo", text: "Codice scritto a mano, veloce da telefono anche con poca linea, pronto per i motori di ricerca." },
      { n: "05", name: "Lancio", text: "Colleghiamo il dominio, controlliamo ogni pagina e pubblichiamo." },
      { n: "06", name: "Evoluzione", text: "Se vuoi, restiamo: aggiornamenti, backup e piccole modifiche, da 50 € al mese." },
    ],
  },
  pricing: {
    eyebrow: "Quanto costa",
    title: "I progetti partono da 400 €.",
    text: "Ogni progetto è diverso. Il prezzo dipende da quante pagine servono, dalle funzioni, dai contenuti e dalle integrazioni: te lo diciamo prima di iniziare, non dopo.",
    includedLabel: "Sempre incluso",
    included: ["Design su misura", "Ottimizzazione mobile", "Modulo contatti", "Basi SEO", "Certificato SSL", "Collegamento dominio e messa online"],
    extraLabel: "A parte",
    extra: "Testi e fotografie, se non li hai già.",
    afterLabel: "Dopo il lancio",
    after: "Manutenzione da 50 € al mese, se la vuoi. Non è obbligatoria.",
    cta: "Richiedi un preventivo",
  },
  studio: {
    eyebrow: "Lo studio",
    title: "Due prospettive.\nUno studio.",
    text: "FICO nasce da un interesse condiviso per il design, la tecnologia e il business. Seguiamo personalmente ogni progetto, dalla prima chiamata alla messa online: fra chi decide e chi costruisce non c'è nessun passaggio intermedio. È anche il motivo per cui possiamo lavorare su misura senza i costi di struttura di un'agenzia.",
    people: [
      { name: "Cesare Cicogna", line: "21 · Università Bocconi, Finanza", focus: "Business, strategia, posizionamento, rapporto con i clienti." },
      { name: "Leonardo Fiore", line: "21 · Politecnico di Milano, Ingegneria Gestionale", focus: "Tecnologia, sviluppo, sistemi, implementazione." },
    ],
  },
  faq: {
    eyebrow: "Domande frequenti",
    title: "Le domande che ci fanno tutti.",
    items: [
      { q: "Quanto costa fare un sito?", a: "I progetti partono da 400 €. Il prezzo finale dipende da quante pagine servono, dalle funzioni e dai contenuti: dopo una prima chiacchierata ti diciamo una cifra, non un intervallo vago." },
      { q: "Quanto tempo serve?", a: "Dipende da quante pagine servono e da quanto in fretta arrivano testi e fotografie — che è quasi sempre la parte più lenta. Ti diamo una data insieme al preventivo, prima di cominciare, e se qualcosa slitta lo sai da noi e non dal calendario." },
      { q: "Che differenza c'è tra sito statico e dinamico?", a: "Un sito statico ha contenuti che restano gli stessi a lungo: le modifiche passano da noi. Un sito dinamico ha un pannello da cui aggiorni tu testi, immagini e pagine, tutte le volte che vuoi. Se pubblichi novità ogni settimana ti serve il secondo; se il menù cambia una volta all'anno, il primo basta e costa meno." },
      { q: "Posso modificare il sito da solo?", a: "Con un sito dinamico sì, da un pannello, e ti facciamo vedere come usarlo. Con un sito vetrina le modifiche passano da noi: di solito sono poche e concordiamo insieme i tempi." },
      { q: "Vi occupate anche di e-commerce?", a: "Sì. Catalogo, schede prodotto, carrello, pagamenti e gestione degli ordini. La piattaforma la scegliamo insieme in base a cosa vendi e a quanti prodotti hai." },
      { q: "Dominio e hosting sono inclusi?", a: "Il collegamento del dominio e la messa online sono inclusi. Il dominio resta sempre intestato a te — è tuo, anche se un domani cambi studio — e il costo annuo, di solito fra i 10 e i 15 euro, lo mettiamo nero su bianco nel preventivo insieme a chi se ne occupa." },
      { q: "Posso rifare un sito che ho già?", a: "Sì, ed è una buona parte di quello che facciamo. Guardiamo il sito attuale, teniamo quello che funziona e rifacciamo il resto, senza perdere le posizioni che hai già sui motori di ricerca." },
      { q: "Il sito funzionerà bene da telefono?", a: "Sì, e non è un extra. La maggior parte delle persone ti troverà dal telefono, quindi è da lì che partiamo a progettare." },
      { q: "Cosa devo darvi per iniziare?", a: "Quello che hai: logo, foto, testi, il sito attuale. Se manca qualcosa non è un problema — testi e fotografie possiamo occuparcene noi, come servizio a parte." },
      { q: "Cosa succede dopo la pubblicazione?", a: "Il sito è tuo. Se vuoi che continuiamo a occuparcene — aggiornamenti, backup, piccole modifiche — la manutenzione parte da 50 € al mese. Non è obbligatoria e si può attivare anche più avanti." },
    ],
  },
  contact: {
    eyebrow: "Contatti",
    title: "Hai un progetto\nin mente?",
    sub: "Raccontaci cosa stai costruendo. Bastano poche righe: alle domande pensiamo noi.",
    cta: "Richiedi un preventivo",
    or: "oppure scrivici a",
    phrase1: "La tua attività\nha già\nuna storia.",
    phrase2: "Noi le diamo\nun mondo digitale.",
  },
  footer: { tagline: "Websites for a brighter tomorrow", privacy: "Privacy", rights: "Tutti i diritti riservati" },
};

const en: Dict = {
  meta: {
    title: "FICO — We design and build websites for businesses",
    description:
      "FICO is a web design and development studio. We build showcase sites, dynamic sites and online shops, made to measure for your business. Projects start from €400.",
  },
  nav: { work: "Work", services: "Services", studio: "Studio", quote: "Start a project", menu: "Menu", close: "Close", sound: "Sound", soundOn: "Sound on" },
  hero: {
    eyebrow: "FICO — Web design & development studio",
    title: "We design and build websites for businesses.",
    sub: "Design, development and digital experiences tailored to your business.",
    ctaPrimary: "Start a project",
    ctaSecondary: "View our work",
    scroll: "Scroll",
    skip: "Skip the film",
  },
  film: {
    chapters: [
      ["Websites for a brighter tomorrow"],
      ["Every business", "is a world."],
      ["Built", "from identity."],
      ["Designed for", "the digital world."],
      ["Crafted,", "not templated."],
      ["Design. Development. Experience."],
      ["We turn businesses", "into digital experiences."],
    ],
  },
  services: {
    eyebrow: "What we build",
    title: "Three ways to be online.",
    intro: "Which one is right depends on what your site has to do.",
    items: [
      {
        n: "01",
        name: "Showcase website",
        text: "Your business online: up to five pages, a clear structure and copy people actually read. It opens fast on a phone, and anyone who finds you understands what you do straight away.",
        who: "Local businesses, restaurants, professionals, makers, portfolios.",
      },
      {
        n: "02",
        name: "Dynamic website",
        text: "For content that changes often. A panel lets you update pages, news, projects or catalogues yourself — no code, and no need to call us.",
        who: "Anyone publishing news, running a catalogue, or taking enquiries and bookings.",
      },
      {
        n: "03",
        name: "E-commerce",
        text: "When you sell online. Catalogue, product pages, cart, payments and order management, built around the decision to buy rather than around the software.",
        who: "Anyone selling products or services beyond the shop floor.",
      },
    ],
  },
  sectors: {
    eyebrow: "Who we build for",
    title: "The worlds we work in.",
    note: "These are the worlds we can work in, not a list of clients.",
    items: ["Hospitality", "Fashion", "Retail", "Automotive", "Professional services", "Food", "Luxury", "Local businesses"],
  },
  work: {
    eyebrow: "Work",
    title: "One project at a time, done properly.",
    intro: "",
    all: "All work",
    visit: "Visit the site",
    challenge: "The challenge",
    idea: "The idea",
    design: "Design",
    build: "Build",
    scope: "What we did",
    sector: "Sector",
    year: "Year",
  },
  process: {
    eyebrow: "How we work",
    title: "Six steps, from the first call to launch day.",
    phrase1: "Not just\na website.",
    phrase2: "A digital\nexperience.",
    steps: [
      { n: "01", name: "Understand", text: "We start from your business: what you sell, who decides, what is holding you back today. An hour of conversation is worth more than ten pages of brief." },
      { n: "02", name: "Direction", text: "We set the pages, the order of the messages and the features you need. Structure and words first, then the visuals — never the other way round." },
      { n: "03", name: "Design", text: "We show you the site before it exists. We review it together until it is exactly right." },
      { n: "04", name: "Build", text: "Hand-written code, fast on a phone even on a weak connection, ready for search engines." },
      { n: "05", name: "Launch", text: "We connect the domain, check every page and publish." },
      { n: "06", name: "Evolve", text: "If you want us to, we stay on: updates, backups and small changes, from €50 a month." },
    ],
  },
  pricing: {
    eyebrow: "What it costs",
    title: "Projects start from €400.",
    text: "Every project is different. The price depends on how many pages you need, the features, the content and the integrations — and we tell you before we start, not after.",
    includedLabel: "Always included",
    included: ["Bespoke design", "Mobile optimisation", "Contact form", "SEO foundations", "SSL certificate", "Domain connection and launch"],
    extraLabel: "Separately",
    extra: "Copywriting and photography, if you don't have them.",
    afterLabel: "After launch",
    after: "Maintenance from €50 a month, if you want it. It isn't compulsory.",
    cta: "Start a project",
  },
  studio: {
    eyebrow: "The studio",
    title: "Two perspectives.\nOne studio.",
    text: "FICO grew out of a shared interest in design, technology and business. We run every project ourselves, from the first call to the day it goes live: there is no layer between the people who decide and the people who build. It is also why we can work to measure without an agency's overhead.",
    people: [
      { name: "Cesare Cicogna", line: "21 · Bocconi University, Finance", focus: "Business, strategy, positioning, client relationships." },
      { name: "Leonardo Fiore", line: "21 · Politecnico di Milano, Management Engineering", focus: "Technology, development, systems, implementation." },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    title: "The questions everyone asks.",
    items: [
      { q: "How much does a website cost?", a: "Projects start from €400. The final price depends on how many pages you need, the features and the content: after a first conversation we give you a figure, not a vague range." },
      { q: "How long does it take?", a: "It depends on how many pages you need and how quickly the copy and photographs arrive — almost always the slowest part. We give you a date with the quote, before we start, and if anything slips you hear it from us rather than from the calendar." },
      { q: "What is the difference between a static and a dynamic website?", a: "A static site holds content that stays the same for a long time: changes come through us. A dynamic site gives you a panel where you update text, images and pages yourself, as often as you like. If you publish something new every week you want the second; if your menu changes once a year, the first is enough and costs less." },
      { q: "Can I update the site myself?", a: "With a dynamic site, yes — from a panel, and we show you how to use it. With a showcase site, changes come through us: there are usually few of them and we agree the timing together." },
      { q: "Do you build online shops?", a: "Yes. Catalogue, product pages, cart, payments and order management. We choose the platform together, based on what you sell and how many products you have." },
      { q: "Are domain and hosting included?", a: "Connecting the domain and putting the site live are included. The domain is always registered in your name — it stays yours, even if one day you work with someone else — and the annual cost, usually between €10 and €15, is written into the quote along with who looks after it." },
      { q: "Can you redesign a site I already have?", a: "Yes, and it is a good part of what we do. We look at the current site, keep what works and rebuild the rest, without losing the search rankings you already have." },
      { q: "Will it work properly on a phone?", a: "Yes, and it isn't an extra. Most people will find you on a phone, so that is where we start designing." },
      { q: "What do you need from me to start?", a: "Whatever you have: logo, photos, copy, your current site. If something is missing it isn't a problem — we can take care of copywriting and photography as a separate service." },
      { q: "What happens after the site goes live?", a: "The site is yours. If you want us to keep looking after it — updates, backups, small changes — maintenance starts at €50 a month. It isn't compulsory, and you can add it later." },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Have a project\nin mind?",
    sub: "Tell us what you're building. A few lines are enough — we'll take care of the questions.",
    cta: "Start a project",
    or: "or write to us at",
    phrase1: "Your business\nalready has\na story.",
    phrase2: "We give it\na digital world.",
  },
  footer: { tagline: "Websites for a brighter tomorrow", privacy: "Privacy", rights: "All rights reserved" },
};

export const DICT: Record<Locale, Dict> = { it, en };
export const getDict = (locale: Locale) => DICT[locale];
