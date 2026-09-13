/**
 * Le direzioni visive della sezione "Scegli il tuo stile".
 * I file sorgente sono PNG da circa due mega l'uno: qui diventano WebP in due
 * misure, perché sono immagini grandi e vanno anche su telefono.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/Users/cesarecicogna/Documents/sito FICO/foto si";
const OUT = "public/img/styles";
mkdirSync(OUT, { recursive: true });

// nome del file sorgente → nome dello stile
const MAP = [
  ["ChatGPT Image 13 set 2026, 11_46_19 (1).png", "quiet-studio"],
  ["ChatGPT Image 13 set 2026, 11_46_19 (2).png", "soft-bloom"],
  ["ChatGPT Image 13 set 2026, 11_46_20 (3).png", "dark-form"],
  ["ChatGPT Image 13 set 2026, 11_46_20 (4).png", "open-air"],
  ["ChatGPT Image 13 set 2026, 11_46_20 (5).png", "shape-notes"],
  ["ChatGPT Image 13 set 2026, 11_46_20 (6).png", "type-motion"],
  ["ChatGPT Image 13 set 2026, 11_50_04 (1).png", "alpine-vision"],
  ["ChatGPT Image 13 set 2026, 11_50_05 (2).png", "glacial-light"],
  ["ChatGPT Image 13 set 2026, 11_50_05 (3).png", "volcanic-form"],
  ["ChatGPT Image 13 set 2026, 11_50_05 (4).png", "open-terrain"],
  ["ChatGPT Image 13 set 2026, 11_50_06 (5).png", "field-notes"],
];

for (const [file, name] of MAP) {
  const src = sharp(`${SRC}/${file}`);
  await src.clone().resize(1400).webp({ quality: 84, effort: 6 }).toFile(`${OUT}/${name}.webp`);
  await src.clone().resize(700).webp({ quality: 78, effort: 6 }).toFile(`${OUT}/${name}@sm.webp`);
  console.log(name);
}
console.log(MAP.length, "stili pronti");
