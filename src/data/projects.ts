import type { Locale } from "@/i18n/config";

/**
 * I lavori. Per aggiungerne uno basta una voce qui: l'indice, la pagina del
 * progetto, la mappa del sito e l'anteprima in home si aggiornano da sole.
 *
 * Niente dati inventati: quello che compare qui è verificato sul progetto
 * reale. Se un campo non c'è, si omette invece di riempirlo.
 */

export interface ProjectCopy {
  sector: string;
  scope: string[];
  tagline: string;
  /** due righe: è quello che si legge prima di entrare nel sito del cliente */
  short: string;
  blocks: { label: string; text: string }[];
  /** omesso finché non esistono numeri veri */
  result?: string;
}

export interface Project {
  slug: string;
  name: string;
  year: number;
  url?: string;
  /** logo del cliente, su fondo trasparente */
  logo: string;
  /** tinta della targa su cui poggia il logo */
  plate: string;
  shots: string[];
  copy: Record<Locale, ProjectCopy>;
}

export const PROJECTS: Project[] = [
  {
    slug: "cereria-cicogna",
    name: "Cereria Cicogna",
    year: 2025,
    url: "https://fico-azienda.github.io/cerariacicogna/",
    logo: "/img/work/cereria-logo.png",
    plate: "#f2efe6",
    shots: ["/img/worlds/food.webp", "/img/worlds/luxury.webp"],
    copy: {
      it: {
        sector: "Industria ceraria artigiana — Novate Milanese",
        scope: ["Design", "Sviluppo", "Messa online", "Assistente di catalogo"],
        tagline: "Sessant'anni di cera, raccontati per la prima volta online.",
        short:
          "Trentotto pagine per un'industria ceraria attiva dal 1960: quattro linee di prodotto, la storia dell'azienda al centro del racconto e un assistente che risponde alle domande sul catalogo.",
        blocks: [
          {
            label: "La sfida",
            text: "Un'azienda con quattro generazioni di lavoro alle spalle e un catalogo che va dagli articoli liturgici alle candele da giardino. Tutto questo esisteva solo per chi entrava in azienda: online non c'era niente che lo raccontasse.",
          },
          {
            label: "L'idea",
            text: "Mettere la storia al centro invece che in fondo. Il sito apre sulla materia — la cera, il tempo, le mani — e porta al catalogo solo dopo. Le quattro linee diventano quattro mondi separati, ciascuno con il proprio tono.",
          },
          {
            label: "Come è fatto",
            text: "Trentotto pagine scritte a mano, veloci da telefono. Il modulo contatti invia due email automatiche, anche in inglese, e un assistente di catalogo risponde sui prodotti attingendo al listino reale.",
          },
        ],
      },
      en: {
        sector: "Artisan wax manufacturer — Novate Milanese, Italy",
        scope: ["Design", "Development", "Launch", "Catalogue assistant"],
        tagline: "Sixty years of wax, told online for the first time.",
        short:
          "Thirty-eight pages for a wax manufacturer working since 1960: four product lines, the company's history at the centre of the story, and an assistant that answers questions about the catalogue.",
        blocks: [
          {
            label: "The challenge",
            text: "A company with four generations behind it and a catalogue running from liturgical candles to garden torches. All of it existed only for people who walked into the building: online, there was nothing that told the story.",
          },
          {
            label: "The idea",
            text: "Put the history at the centre rather than at the bottom. The site opens on the material — the wax, the time, the hands — and reaches the catalogue only afterwards. The four lines became four separate worlds, each with its own tone.",
          },
          {
            label: "How it's built",
            text: "Thirty-eight hand-written pages, fast on a phone. The contact form sends two automatic emails, in English too, and a catalogue assistant answers product questions from the real price list.",
          },
        ],
      },
    },
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
