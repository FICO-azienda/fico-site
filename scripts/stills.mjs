/**
 * Fotogrammi fermi per la sezione "Selected Worlds" e per i meta social.
 * Vengono dal film stesso: il sito resta un mondo visivo solo.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

mkdirSync('public/img/worlds', { recursive: true });
mkdirSync('.tmp', { recursive: true });
const FILM = 'public/video/fico-film.mp4';
const ff = (a) => execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', ...a]);

// secondo del film -> settore
const WORLDS = [
  ['hospitality',  1.6],   // la hall, l'acqua, la montagna
  ['fashion',     20.2],   // la seta
  ['retail',      27.0],   // l'oggetto sul piedistallo
  ['automotive',   8.2],   // l'auto di profilo
  ['services',    12.9],   // il wireframe tecnico
  ['food',         4.9],   // il marmo
  ['luxury',      15.6],   // il cerchio, il dettaglio
  ['local',       33.6],   // le interfacce che fluttuano
];

for (const [name, t] of WORLDS) {
  ff(['-ss', String(t), '-i', FILM, '-frames:v', '1', '-q:v', '2', `.tmp/${name}.jpg`]);
  await sharp(`.tmp/${name}.jpg`).resize(1280).webp({ quality: 74 }).toFile(`public/img/worlds/${name}.webp`);
  await sharp(`.tmp/${name}.jpg`).resize(640).webp({ quality: 66 }).toFile(`public/img/worlds/${name}@sm.webp`);
}
console.log('mondi:', WORLDS.length);

// favicon dal marchio, su fondo avorio del film
const mark = await sharp('public/img/fico-mark.png').resize({ height: 320, fit: 'inside' }).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#fcf4dd' } })
  .composite([{ input: mark, gravity: 'center' }]).png().toFile('public/icon.png');
await sharp('public/icon.png').resize(180).png().toFile('public/apple-icon.png');

// immagine social: ultimo fotogramma del film, gia' brandizzato
await sharp('.tmp/local.jpg').resize(1200, 630, { fit: 'cover' })
  .composite([{ input: await sharp('public/img/fico-mark.png').resize({ height: 150 }).toBuffer(), gravity: 'center' }])
  .jpeg({ quality: 84 }).toFile('public/og.jpg');
console.log('icone e og pronte');
