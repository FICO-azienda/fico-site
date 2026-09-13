import type { Locale } from "@/i18n/config";

/**
 * Le direzioni visive proposte in "Scegli il tuo stile".
 *
 * Non sono modelli da riempire e il testo della sezione lo dice apertamente:
 * sono punti di partenza. Non sono nemmeno lavori svolti, quindi non stanno
 * fra i progetti.
 */

export interface Style {
  id: string;
  image: string;
  /** tinta dominante: serve a intonare il fondo della scheda mentre carica */
  tone: string;
  copy: Record<Locale, { name: string; mood: string; fit: string }>;
}

export const STYLES: Style[] = [
  {
    id: "quiet-studio",
    image: "/img/styles/quiet-studio.webp",
    tone: "#e8e0d2",
    copy: {
      it: {
        name: "Quiet Studio",
        mood: "Calmo e materico. Tanto spazio bianco, legno e luce naturale, un carattere con grazie che non alza mai la voce.",
        fit: "Studi professionali · Architetti · Consulenti · Interior",
      },
      en: {
        name: "Quiet Studio",
        mood: "Calm and material. Plenty of white space, wood and daylight, a serif that never raises its voice.",
        fit: "Practices · Architects · Consultants · Interiors",
      },
    },
  },
  {
    id: "soft-bloom",
    image: "/img/styles/soft-bloom.webp",
    tone: "#e9e0cf",
    copy: {
      it: {
        name: "Soft Bloom",
        mood: "Delicato e fatto a mano. Fotografie appuntate come su una parete, ombre di foglie, carta strappata.",
        fit: "Fioristi · Artigiani · Beauty · Cerimonie",
      },
      en: {
        name: "Soft Bloom",
        mood: "Delicate and handmade. Photographs pinned as if to a wall, leaf shadows, torn paper edges.",
        fit: "Florists · Makers · Beauty · Weddings",
      },
    },
  },
  {
    id: "dark-form",
    image: "/img/styles/dark-form.webp",
    tone: "#0d1210",
    copy: {
      it: {
        name: "Dark Form",
        mood: "Contrasto netto e notturno. Fondo scuro, fotografia grande, titoli con grazie affilate.",
        fit: "Moda · Gioielli · Fotografi · Locali",
      },
      en: {
        name: "Dark Form",
        mood: "Sharp and nocturnal. Dark ground, large photography, headlines set in a fine-cut serif.",
        fit: "Fashion · Jewellery · Photographers · Venues",
      },
    },
  },
  {
    id: "open-air",
    image: "/img/styles/open-air.webp",
    tone: "#3f4d3f",
    copy: {
      it: {
        name: "Open Air",
        mood: "Aria e luce naturale. La fotografia occupa tutto lo schermo, il testo ci appoggia sopra con leggerezza.",
        fit: "Turismo · Hospitality · Outdoor · Benessere",
      },
      en: {
        name: "Open Air",
        mood: "Air and daylight. Photography fills the screen and the text rests lightly on top of it.",
        fit: "Tourism · Hospitality · Outdoor · Wellbeing",
      },
    },
  },
  {
    id: "shape-notes",
    image: "/img/styles/shape-notes.webp",
    tone: "#eceae4",
    copy: {
      it: {
        name: "Shape Notes",
        mood: "Geometrico ed essenziale. Forme piene, un solo colore d'accento, tipografia asciutta e molto ordine.",
        fit: "Studi tecnici · Ingegneria · Consulenza · Startup",
      },
      en: {
        name: "Shape Notes",
        mood: "Geometric and essential. Solid shapes, a single accent colour, dry typography and a lot of order.",
        fit: "Technical practices · Engineering · Consulting · Startups",
      },
    },
  },
  {
    id: "type-motion",
    image: "/img/styles/type-motion.webp",
    tone: "#2a1f18",
    copy: {
      it: {
        name: "Type & Motion",
        mood: "Caldo e scuro, con la tipografia protagonista. Il titolo è l'immagine, e il sito si apre schiarendo.",
        fit: "Ristoranti · Hotel · Brand · Food",
      },
      en: {
        name: "Type & Motion",
        mood: "Warm and dark, with typography as the subject. The headline is the image, and the site opens up into light.",
        fit: "Restaurants · Hotels · Brands · Food",
      },
    },
  },
  {
    id: "alpine-vision",
    image: "/img/styles/alpine-vision.webp",
    tone: "#cfd4cd",
    copy: {
      it: {
        name: "Alpine Vision",
        mood: "Ampio e limpido. Un paesaggio che riempie lo schermo, titoli con grazie verde scuro, aria in ogni angolo.",
        fit: "Hotel di montagna · Rifugi · Turismo · Immobiliare",
      },
      en: {
        name: "Alpine Vision",
        mood: "Wide and clear. A landscape that fills the screen, dark green serif headlines, air in every corner.",
        fit: "Mountain hotels · Lodges · Tourism · Property",
      },
    },
  },
  {
    id: "glacial-light",
    image: "/img/styles/glacial-light.webp",
    tone: "#d7e2ea",
    copy: {
      it: {
        name: "Glacial Light",
        mood: "Freddo e pulitissimo. Azzurri pallidi, moltissima luce, un carattere sottile che lascia respirare tutto.",
        fit: "Cliniche · Benessere · Tecnologia · Cosmetica",
      },
      en: {
        name: "Glacial Light",
        mood: "Cool and immaculate. Pale blues, a great deal of light, and a fine serif that lets everything breathe.",
        fit: "Clinics · Wellbeing · Technology · Skincare",
      },
    },
  },
  {
    id: "volcanic-form",
    image: "/img/styles/volcanic-form.webp",
    tone: "#2b211c",
    copy: {
      it: {
        name: "Volcanic Form",
        mood: "Drammatico e caldo. Fondo scuro acceso da una sola fonte di luce, titoli enormi, tensione.",
        fit: "Ristoranti · Cantine · Palestre · Brand decisi",
      },
      en: {
        name: "Volcanic Form",
        mood: "Dramatic and warm. A dark ground lit by a single source, enormous headlines, tension.",
        fit: "Restaurants · Wineries · Gyms · Bold brands",
      },
    },
  },
  {
    id: "open-terrain",
    image: "/img/styles/open-terrain.webp",
    tone: "#dbdcc8",
    copy: {
      it: {
        name: "Open Terrain",
        mood: "Luce italiana di prima mattina. Colline, verde profondo, un tono che sa di territorio senza essere rustico.",
        fit: "Agriturismi · Cantine · Olio e vino · Matrimoni",
      },
      en: {
        name: "Open Terrain",
        mood: "Early Italian light. Hills, deep green, a tone that speaks of the land without turning rustic.",
        fit: "Farm stays · Wineries · Oil and wine · Weddings",
      },
    },
  },
  {
    id: "field-notes",
    image: "/img/styles/field-notes.webp",
    tone: "#dfd9cb",
    copy: {
      it: {
        name: "Field Notes",
        mood: "Luminoso e gentile. Fiori in controluce, appunti scritti a mano, un tono che mette di buon umore.",
        fit: "Vivai · Erboristerie · Cosmetica naturale · Negozi bio",
      },
      en: {
        name: "Field Notes",
        mood: "Bright and gentle. Backlit flowers, handwritten notes, a tone that puts people in a good mood.",
        fit: "Nurseries · Herbalists · Natural skincare · Organic shops",
      },
    },
  },
];
