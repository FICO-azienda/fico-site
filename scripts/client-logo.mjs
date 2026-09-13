/**
 * Logo del cliente pronto per il sito.
 *
 * Attenzione al fondo: questo file ha GIÀ la trasparenza, con il nero sotto i
 * pixel invisibili. Scontornarlo presumendo un fondo bianco rende opaco proprio
 * quel nero e il logo finisce dentro un riquadro scuro. Quindi: se l'alpha c'è
 * già, non si tocca; si scontorna soltanto quando manca davvero.
 */
import sharp from "sharp";

const SRC = "/Users/cesarecicogna/Downloads/sito candele/logo-stork.png";
const OUT = "public/img/work/cereria-logo.png";

const meta = await sharp(SRC).metadata();
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

let transparent = 0;
for (let i = 3; i < data.length; i += 4) if (data[i] < 20) transparent++;
const alreadyCut = meta.hasAlpha && transparent > info.width * info.height * 0.05;

if (!alreadyCut) {
  // nessuna trasparenza utile: il fondo chiaro diventa invisibile
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i + 3] = lum > 243 ? 0 : Math.min(255, Math.round((243 - lum) * 5));
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 8 })
  // disegno a tratto: l'ingrandimento con lanczos resta pulito e serve per gli
  // schermi ad alta densità, dove il file nativo sarebbe appena sgranato
  .resize({ width: 620, fit: "inside", kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const out = await sharp(OUT).metadata();
console.log(alreadyCut ? "trasparenza già presente, non toccata" : "fondo chiaro scontornato");
console.log("cereria-logo.png →", out.width + "x" + out.height);
