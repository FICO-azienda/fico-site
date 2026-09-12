/**
 * Logo della giuntura ad alta risoluzione.
 *
 * Il ritaglio preso dal fotogramma finale e' nativo a 266 px e a schermo
 * viene ingrandito fino a 2,3 volte: si sgrana. Qui si usa il logo sorgente,
 * allineandolo al video sul MARCHIO — la parte nitida e riconoscibile —
 * invece che sul riquadro totale, che nel video comprende il claim sfocato
 * e falserebbe la scala.
 */
import sharp from 'sharp';

const FRAME = 'public/img/final-frame.webp';   // 1280x720, l'ultimo fotogramma
const CLEAN = 'public/img/fico-lockup.png';    // logo sorgente, gia' scontornato

const analyse = async (file, ivory) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const ink = (x, y) => {
    const o = (y * w + x) * 4;
    if (!ivory) return data[o + 3] > 40;
    return Math.abs(data[o] - 252) + Math.abs(data[o + 1] - 244) + Math.abs(data[o + 2] - 221) > 26;
  };
  const rows = [];
  for (let y = 0; y < h; y++) { let n = 0; for (let x = 0; x < w; x++) if (ink(x, y)) n++; rows.push(n); }
  const bands = [];
  let s = null;
  rows.forEach((n, y) => {
    if (n > 1 && s === null) s = y;
    if (n <= 1 && s !== null) { bands.push([s, y - 1]); s = null; }
  });
  if (s !== null) bands.push([s, h - 1]);
  const xr = ([a, b]) => {
    let x0 = w, x1 = 0;
    for (let y = a; y <= b; y++) for (let x = 0; x < w; x++) if (ink(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    return { x0, x1, w: x1 - x0 + 1 };
  };
  return { w, h, bands, mark: { y0: bands[0][0], y1: bands[0][1], ...xr(bands[0]) } };
};

const v = await analyse(FRAME, true);
const c = await analyse(CLEAN, false);

// scala che porta il marchio del file sorgente alla misura che ha nel video
const scale = v.mark.w / c.mark.w;
const outW = c.w * scale;             // larghezza del lockup in coordinate fotogramma
const outH = c.h * scale;
const left = v.mark.x0 - c.mark.x0 * scale;
const top  = v.mark.y0 - c.mark.y0 * scale;

console.log('marchio nel video   ', JSON.stringify(v.mark));
console.log('marchio nel sorgente', JSON.stringify(c.mark));
console.log('scala', scale.toFixed(4));
console.log('lockup in coordinate fotogramma:',
  { left: +left.toFixed(1), top: +top.toFixed(1), w: +outW.toFixed(1), h: +outH.toFixed(1) });

// il file resta alla sua risoluzione nativa: e' quella la riserva di nitidezza
await sharp(CLEAN).png({ compressionLevel: 9 }).toFile('public/img/seam-logo.png');

const FW = 1280, FH = 720;
console.log('\n--- da riportare in src/lib/film.ts ---');
console.log(`  width: ${+(outW / FW).toFixed(5)},        // quota della larghezza del fotogramma`);
console.log(`  aspect: ${+(c.w / c.h).toFixed(5)},`);
console.log(`  centerX: ${+((left + outW / 2) / FW).toFixed(5)},`);
console.log(`  centerY: ${+((top + outH / 2) / FH).toFixed(5)},`);
