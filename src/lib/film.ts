/**
 * La sceneggiatura del film.
 * I tempi sono i secondi reali del montaggio (40,13"): ogni frase e' agganciata
 * a cio' che si vede in quel momento, non a una frazione astratta di scroll.
 */

export const FILM_DURATION = 40.13;

/** Da qui in poi il fotogramma e' gia' avorio pieno con il logo al centro. */
export const SEAM_START = 38.9;

/**
 * Posizione del logo dentro il fotogramma finale (1280x720). I valori sono
 * calcolati da scripts/seam-logo.mjs allineando il MARCHIO del file sorgente
 * a quello del video: allinearsi sul riquadro totale sarebbe sbagliato,
 * perche' nel video il claim e' sfocato e "sbava" di qualche pixel.
 */
export const SEAM_LOGO = {
  frameW: 1280,
  frameH: 720,
  centerX: 0.49659,
  centerY: 0.50069,
  width: 0.20742,
  /** proporzioni del file del logo, non del ritaglio sfocato del video */
  aspect: 1.18,
} as const;

export type Placement =
  | "corner"
  | "bottom-left"
  | "right-mid"
  | "left-low"
  | "right-high"
  | "left-mid"
  | "center-wide"
  | "left-big";

export interface Chapter {
  id: string;
  /** comparsa, piena leggibilita', inizio uscita, uscita completa */
  t: [number, number, number, number];
  place: Placement;
  eyebrow?: string;
  lines: string[];
  size: "d-xl" | "d-lg" | "d-md" | "d-sm";
}

export const CHAPTERS: Chapter[] = [
  {
    id: "mark",
    t: [-1, 0, 3.2, 4.2],
    place: "corner",
    lines: ["FICO"],
    size: "d-sm",
  },
  {
    id: "tagline",
    t: [0.9, 2.2, 5.2, 6.2],
    place: "bottom-left",
    eyebrow: "Digital studio",
    lines: ["Websites", "for a brighter", "tomorrow"],
    size: "d-xl",
  },
  {
    id: "world",
    t: [6.6, 7.6, 10.2, 11.2],
    place: "right-mid",
    eyebrow: "01",
    lines: ["Every business", "is a world."],
    size: "d-lg",
  },
  {
    id: "identity",
    t: [12.0, 13.0, 15.4, 16.4],
    place: "left-low",
    eyebrow: "02",
    lines: ["Built", "from identity."],
    size: "d-lg",
  },
  {
    id: "digital",
    t: [17.0, 18.0, 20.2, 21.2],
    place: "right-high",
    eyebrow: "03",
    lines: ["Designed for", "the digital world."],
    size: "d-md",
  },
  {
    id: "crafted",
    t: [21.8, 22.8, 25.4, 26.4],
    place: "left-mid",
    eyebrow: "04",
    lines: ["Crafted,", "not templated."],
    size: "d-lg",
  },
  {
    id: "triad",
    t: [27.2, 28.2, 30.4, 31.4],
    place: "center-wide",
    lines: ["Design. Development. Experience."],
    size: "d-sm",
  },
  {
    id: "turn",
    t: [32.0, 33.2, 36.0, 37.0],
    place: "left-big",
    eyebrow: "05",
    lines: ["We turn businesses", "into digital experiences."],
    size: "d-md",
  },
];

/**
 * Peso di un capitolo al tempo t: 0 assente, 1 pienamente leggibile.
 * La salita e la discesa sono ammorbidite, cosi' il testo non "scatta".
 */
export function chapterWeight(c: Chapter, t: number): number {
  const [a, b, cc, d] = c.t;
  if (t <= a || t >= d) return 0;
  if (t >= b && t <= cc) return 1;
  const raw = t < b ? (t - a) / (b - a) : 1 - (t - cc) / (d - cc);
  return raw * raw * (3 - 2 * raw); // smoothstep
}
