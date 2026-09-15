/**
 * Fotogrammi fermi per "Selected worlds" e per il pannello dei servizi.
 *
 * Il tetto di qualita' e' il film: 1280x720. Non si inventa dettaglio, ma si
 * evitano i due difetti che si notano davvero — gli artefatti di compressione
 * e la sfocatura dell'ingrandimento fatto dal browser. Quindi: qualita' alta,
 * maschera di contrasto leggera, e un formato dedicato per il pannello
 * verticale dei servizi, che altrimenti userebbe meno della meta' dei pixel
 * disponibili.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

mkdirSync('public/img/worlds', { recursive: true });
mkdirSync('.tmp', { recursive: true });
// master di lavoro: non è più servito dal sito, il film ora è una sequenza di fotogrammi
const FILM = 'media/fico-film.mp4';
const ff = (a) => execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...a]);

const WORLDS = [
  ['hospitality',  1.6],
  ['fashion',     20.2],
  ['retail',      27.0],
  ['automotive',   8.2],
  ['services',    12.9],
  ['food',         4.9],
  ['luxury',      15.6],
  ['local',       33.6],
];

/** contrasto locale leggero: recupera la morbidezza del 720p senza far comparire aloni */
const crisp = (p) => p.sharpen({ sigma: 0.7, m1: 0.4, m2: 0.9 });

for (const [name, t] of WORLDS) {
  // PNG intermedio: niente doppia compressione prima del ridimensionamento
  ff(['-ss', String(t), '-i', FILM, '-frames:v', '1', `.tmp/${name}.png`]);
  const src = sharp(`.tmp/${name}.png`);

  // fondo a tutta pagina: ingrandito con lanczos, meglio del bilineare del browser
  await crisp(src.clone().resize(1920, 1080, { kernel: 'lanczos3' }))
    .webp({ quality: 86, effort: 6 }).toFile(`public/img/worlds/${name}.webp`);

  await crisp(src.clone().resize(960))
    .webp({ quality: 80, effort: 6 }).toFile(`public/img/worlds/${name}@sm.webp`);

  // pannello verticale dei servizi: ritaglio 4:5 fatto qui, a piena risoluzione
  await crisp(src.clone().resize(1100, 1375, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }))
    .webp({ quality: 86, effort: 6 }).toFile(`public/img/worlds/${name}@portrait.webp`);
}
console.log('mondi:', WORLDS.length, '— tre formati ciascuno');

// poster: resta alla risoluzione del film, deve somigliare al primo fotogramma
ff(['-i', FILM, '-frames:v', '1', '.tmp/first.png']);
await sharp('.tmp/first.png').webp({ quality: 88, effort: 6 }).toFile('public/img/poster.webp');
ff(['-sseof', '-0.15', '-i', FILM, '-frames:v', '1', '.tmp/last.png']);
await sharp('.tmp/last.png').webp({ quality: 90, effort: 6 }).toFile('public/img/final-frame.webp');

// icone e anteprima social
const mark = await sharp('public/img/fico-mark.png').resize({ height: 320, fit: 'inside' }).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#fcf4dd' } })
  .composite([{ input: mark, gravity: 'center' }]).png({ compressionLevel: 9 }).toFile('public/icon.png');
await sharp('public/icon.png').resize(180).png({ compressionLevel: 9 }).toFile('public/apple-icon.png');
await sharp('.tmp/local.png').resize(1200, 630, { fit: 'cover', kernel: 'lanczos3' })
  .composite([{ input: await sharp('public/img/fico-mark.png').resize({ height: 150 }).toBuffer(), gravity: 'center' }])
  .jpeg({ quality: 90, mozjpeg: true }).toFile('public/og.jpg');

rmSync('.tmp', { recursive: true, force: true });
console.log('poster, icone e og aggiornati');
