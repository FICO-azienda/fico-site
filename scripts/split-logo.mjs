/**
 * Ricava dal logo sorgente tre asset su fondo trasparente: lockup completo,
 * solo marchio F, solo parola FICO. I ritagli si calcolano dai pixel (fasce
 * trasparenti + bounding box) invece che a coordinate fisse, cosi' restano
 * corretti anche se il logo viene rifatto.
 */
import sharp from 'sharp';

const LOGO = '/Users/cesarecicogna/Documents/sito FICO/video/1a8459c3-8056-4bc6-bc35-f7b28bfe1684.png';

// 1. scontorno: il bianco caldo del file sorgente diventa trasparente
const { data, info } = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
for (let i = 0; i < data.length; i += 4) {
  const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
  data[i + 3] = lum > 238 ? 0 : Math.min(255, Math.round((238 - lum) * 6));
}
const A = (x, y) => data[(y * w + x) * 4 + 3];

// 2. fasce orizzontali con inchiostro = le tre parti del lockup
const bands = [];
let start = null;
for (let y = 0; y < h; y++) {
  let ink = 0;
  for (let x = 0; x < w; x++) if (A(x, y) > 40) ink++;
  const on = ink > 2;
  if (on && start === null) start = y;
  if (!on && start !== null) { bands.push([start, y - 1]); start = null; }
}
if (start !== null) bands.push([start, h - 1]);
console.log('fasce:', bands.map(([a, b]) => `${a}-${b}`).join('  '));

const bbox = (y0, y1) => {
  let x0 = w, x1 = 0;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < w; x++) if (A(x, y) > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
};
const base = sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 });
const save = async (box, file) => {
  await base.clone().extract(box).toFile(file);
  const m = await sharp(file).metadata();
  console.log(file.replace('public/img/', '') + ' →', m.width + 'x' + m.height);
};

const all = bbox(bands[0][0], bands.at(-1)[1]);
await save(all, 'public/img/fico-lockup.png');
await save(bbox(bands[0][0], bands[0][1]), 'public/img/fico-mark.png');
await save(bbox(bands[1][0], bands[1][1]), 'public/img/fico-wordmark.png');
