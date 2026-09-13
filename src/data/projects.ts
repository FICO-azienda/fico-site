import type { Locale } from "@/i18n/config";

/**
 * I lavori. Per aggiungerne uno basta una voce qui: l'indice, la pagina del
 * caso studio, la mappa del sito e l'anteprima in home si aggiornano da sole.
 *
 * Niente dati inventati: quello che compare qui e' verificato sul progetto
 * reale. Se un campo non c'e', si omette invece di riempirlo.
 */

export interface ProjectCopy {
  tagline: string;
  challenge: string;
  idea: string;
  design: string;
  build: string;
  /** omesso finche' non esistono numeri veri */
  result?: string;
  scope: string[];
  sector: string;
}

export interface Project {
  slug: string;
  name: string;
  year: number;
  url?: string;
  cover: string;
  /** quote del film da cui provengono le immagini di appoggio */
  shots: string[];
  copy: Record<Locale, ProjectCopy>;
}

export const PROJECTS: Project[] = [
  {
    slug: "cereria-cicogna",
    name: "Cereria Cicogna",
    year: 2025,
    url: "https://fico-azienda.github.io/cerariacicogna/",
    cover: "/img/worlds/food.webp",
    shots: ["/img/worlds/luxury.webp", "/img/worlds/retail.webp"],
    copy: {
      it: {
        sector: "Industria ceraria artigiana — Novate Milanese",
        scope: ["Design", "Sviluppo", "Messa online", "Assistente di catalogo"],
        tagline: "Sessant'anni di cera, raccontati per la prima volta online.",
        challenge:
          "Un'industria ceraria attiva dal 1960, con quattro generazioni di lavoro alle spalle e un catalogo che va dagli articoli liturgici alle candele da giardino. Tutto questo esisteva solo per chi entrava in azienda: online non c'era niente che lo raccontasse.",
        idea:
          "Mettere la storia al centro invece che in fondo. Il sito si apre sulla materia — la cera, il tempo, le mani — e porta il visitatore al catalogo solo dopo avergli fatto capire con chi ha a che fare. Le quattro linee di prodotto diventano quattro mondi separati, ciascuno con il proprio tono.",
        design:
          "Una linea sobria e calda, costruita sui colori della cera. Tipografia ampia, fotografia grande, animazioni legate allo scorrimento che accompagnano la lettura senza mai metterle davanti. La cronologia dell'azienda, dal 1960 a oggi, e' diventata il cuore della pagina «chi siamo».",
        build:
          "Trentotto pagine scritte a mano, veloci da telefono e pronte per i motori di ricerca. Il modulo contatti invia due email automatiche — una all'azienda e una di conferma al cliente, anche in inglese — e un assistente di catalogo risponde alle domande sui prodotti attingendo al listino reale.",
      },
      en: {
        sector: "Artisan wax manufacturer — Novate Milanese, Italy",
        scope: ["Design", "Development", "Launch", "Catalogue assistant"],
        tagline: "Sixty years of wax, told online for the first time.",
        challenge:
          "A wax manufacturer working since 1960, with four generations behind it and a catalogue running from liturgical candles to garden torches. All of it existed only for people who walked into the building: online, there was nothing that told the story.",
        idea:
          "Put the history at the centre rather than at the bottom. The site opens on the material — the wax, the time, the hands — and takes the visitor to the catalogue only once they understand who they are dealing with. The four product lines became four separate worlds, each with its own tone.",
        design:
          "A restrained, warm direction built on the colours of wax. Generous typography, large photography, scroll-linked motion that follows the reading rather than interrupting it. The company timeline, from 1960 to today, became the heart of the about page.",
        build:
          "Thirty-eight hand-written pages, fast on a phone and ready for search engines. The contact form sends two automatic emails — one to the company and a confirmation to the customer, in English too — and a catalogue assistant answers product questions from the real price list.",
      },
    },
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
