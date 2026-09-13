/**
 * Immagine del pannello "Cosa costruiamo".
 * Il pannello è verticale su schermo grande e orizzontale su telefono, quindi
 * servono due tagli: uno 4:5 e uno 3:2, entrambi dallo stesso scatto.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "/Users/cesarecicogna/Downloads/Nuova cartella con elementi 4/caa87d9c-bd18-49f8-9a5b-49cdf0c58a9a.png";
const OUT = "public/img/services";
mkdirSync(OUT, { recursive: true });

const src = sharp(SRC);
const { width, height } = await src.metadata();
console.log("sorgente", width + "x" + height);

// verticale: il taglio tiene il centro, dove stanno terrazza, lago e montagne
await src.clone()
  .resize(1100, 1375, { fit: "cover", position: "centre" })
  .webp({ quality: 84, effort: 6 })
  .toFile(`${OUT}/terrazza@portrait.webp`);

// orizzontale, per il telefono
await src.clone()
  .resize(1600)
  .webp({ quality: 82, effort: 6 })
  .toFile(`${OUT}/terrazza.webp`);

for (const f of ["terrazza@portrait.webp", "terrazza.webp"]) {
  const m = await sharp(`${OUT}/${f}`).metadata();
  console.log(f, m.width + "x" + m.height);
}
