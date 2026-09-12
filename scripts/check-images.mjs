/**
 * Confronto fra il logo cosi' come lo rende il video e il file sorgente:
 * servono le stesse proporzioni, altrimenti sostituendo il ritaglio del
 * fotogramma con l'originale ad alta risoluzione si vedrebbe uno scarto
 * proprio nel momento della dissolvenza.
 */
import sharp from 'sharp';

const bboxOf = async (file, isIvory) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const ink = (x, y) => {
    const o = (y * w + x) * 4;
    if (!isIvory) return data[o + 3] > 40;                     // file con trasparenza
    const d = Math.abs(data[o] - 252) + Math.abs(data[o + 1] - 244) + Math.abs(data[o + 2] - 221);
    return d > 26;                                             // fotogramma su avorio
  };
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink(x, y)) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  // fasce orizzontali: marchio / parola / claim
  const bands = [];
  let start = null;
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < w; x++) if (ink(x, y)) n++;
    const on = n > 1;
    if (on && start === null) start = y;
    if (!on && start !== null) { bands.push([start, y - 1]); start = null; }
  }
  if (start !== null) bands.push([start, h - 1]);
  return { file, size: `${w}x${h}`, box: { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 },
           ratio: +((x1 - x0 + 1) / (y1 - y0 + 1)).toFixed(3), bands };
};

const frame = await bboxOf('public/img/final-frame.webp', true);
const clean = await bboxOf('public/img/fico-lockup.png', false);
console.log('DAL VIDEO   ', JSON.stringify(frame));
console.log('SORGENTE    ', JSON.stringify(clean));
console.log('scarto proporzioni:', (Math.abs(frame.ratio - clean.ratio) / clean.ratio * 100).toFixed(1) + '%');

// larghezza della sola parola FICO: e' l'elemento piu' riconoscibile,
// quindi e' su quella che conviene allineare i due lockup
const wordW = (b, bands, file) => bands.length >= 2 ? bands[1] : null;
console.log('fasce video :', frame.bands.map(([a, b]) => `${a}-${b}`).join(' '));
console.log('fasce file  :', clean.bands.map(([a, b]) => `${a}-${b}`).join(' '));
