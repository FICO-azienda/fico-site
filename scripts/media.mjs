/**
 * Pipeline media FICO.
 * Prende i due clip Runway e produce i master ottimizzati per lo scrub:
 * lo scrub allo scroll e' fluido solo se i keyframe sono fitti, perche' ogni
 * seek deve decodificare dal keyframe precedente. I sorgenti hanno un GOP di
 * 58 e 128 fotogrammi: inguardabili in scrub. Qui si riencoda con GOP corto.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const CLIP_A = '/Users/cesarecicogna/Documents/sito FICO/Agent Video - Image 1 depicts the dark architectural lobby location_ its curved black-green marble w.mp4';
const CLIP_B = '/Users/cesarecicogna/Downloads/Agent Video - Image 1 depicts the unbranded luxury product object on its pedestal_Image 2 depicts th.mp4';
const MUSIC  = '/Users/cesarecicogna/Documents/sito FICO/Agent Music - Moody_ minimal cinematic score for a premium luxury brand film_ Dark_ elegant and rest.mp3';
const LOGO   = '/Users/cesarecicogna/Documents/sito FICO/video/1a8459c3-8056-4bc6-bc35-f7b28bfe1684.png';

// il master mp4 resta come sorgente di lavoro, fuori da public: il sito usa i fotogrammi
const OUT_V = 'media';
const OUT_I = 'public/img';
const OUT_A = 'public/audio';
[OUT_V, OUT_I, OUT_A, '.tmp'].forEach(d => mkdirSync(d, { recursive: true }));

const ff = (args) => execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + ' MB';

// ---------------------------------------------------------------- 1. concat
// Un solo file: il clip B riprende dalla seta verde su cui finisce il clip A,
// quindi la giunzione e' invisibile e lo scrub ha una timeline sola.
console.log('→ unisco i due clip…');
writeFileSync('.tmp/list.txt', `file '${CLIP_A.replace(/'/g, "'\\''")}'\nfile '${CLIP_B.replace(/'/g, "'\\''")}'\n`);

const common = (crf, gop) => [
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-crf', String(crf), '-g', String(gop), '-keyint_min', String(gop),
  '-sc_threshold', '0', '-preset', 'slow', '-movflags', '+faststart', '-an',
];

console.log('→ master desktop (scrub, keyframe fitti)…');
if (!existsSync(join(OUT_V, 'fico-film.mp4'))) ff(['-f', 'concat', '-safe', '0', '-i', '.tmp/list.txt', ...common(22, 6), join(OUT_V, 'fico-film.mp4')]);
console.log('   fico-film.mp4', mb(join(OUT_V, 'fico-film.mp4')));

console.log('→ versione mobile (riproduzione normale, niente scrub)…');
if (!existsSync(join(OUT_V, 'fico-film-mobile.mp4'))) ff(['-f', 'concat', '-safe', '0', '-i', '.tmp/list.txt',
    '-vf', 'scale=854:-2', ...common(27, 12), join(OUT_V, 'fico-film-mobile.mp4')]);
console.log('   fico-film-mobile.mp4', mb(join(OUT_V, 'fico-film-mobile.mp4')));

// ---------------------------------------------------------------- 2. poster
console.log('→ poster e fotogramma finale…');
ff(['-i', CLIP_A, '-frames:v', '1', '-q:v', '2', '.tmp/first.jpg']);
ff(['-sseof', '-0.15', '-i', CLIP_B, '-frames:v', '1', '-q:v', '2', '.tmp/last.jpg']);
await sharp('.tmp/first.jpg').resize(1280).webp({ quality: 72 }).toFile(join(OUT_I, 'poster.webp'));
await sharp('.tmp/last.jpg').resize(1280).webp({ quality: 82 }).toFile(join(OUT_I, 'final-frame.webp'));

// --------------------------------------------------- 3. logo del fotogramma
// Ritaglio il logo dall'ULTIMO FOTOGRAMMA del film, non dal file sorgente:
// deve combaciare pixel per pixel con il video nel momento della giunzione.
const SEAM = { x: 506, y: 248, w: 266, h: 214 }; // misurato su lastB.jpg 1280x720
const raw = await sharp('.tmp/last.jpg').extract({ left: SEAM.x, top: SEAM.y, width: SEAM.w, height: SEAM.h })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
{
  const { data, info } = raw;
  // l'avorio del film (#fcf4dd) diventa trasparente, il verde resta
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.abs(data[i] - 252) + Math.abs(data[i + 1] - 244) + Math.abs(data[i + 2] - 221);
    data[i + 3] = d < 24 ? 0 : Math.min(255, Math.round((d / 90) * 255));
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 }).toFile(join(OUT_I, 'seam-logo.png'));
}

// ------------------------------------------------------- 4. logo pulito
console.log('→ logo su fondo trasparente…');
const src = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
{
  const { data, info } = src;
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i + 3] = lum > 244 ? 0 : Math.min(255, Math.round((244 - lum) * 3));
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(join(OUT_I, 'fico-lockup.png'));

  // Solo il marchio F, per nav e favicon: e' la parte alta del lockup gia'
  // rifilato, quindi la ritaglio in proporzione invece che a coordinate fisse.
  const lock = await sharp(join(OUT_I, 'fico-lockup.png')).metadata();
  await sharp(join(OUT_I, 'fico-lockup.png'))
    .extract({ left: 0, top: 0, width: lock.width, height: Math.round(lock.height * 0.56) })
    .trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(join(OUT_I, 'fico-mark.png'));
}

// ------------------------------------------------------------- 5. musica
console.log('→ colonna sonora…');
ff(['-i', MUSIC, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', join(OUT_A, 'fico-score.m4a')]);
console.log('   fico-score.m4a', mb(join(OUT_A, 'fico-score.m4a')));

rmSync('.tmp', { recursive: true, force: true });
console.log('\n✓ fatto');
