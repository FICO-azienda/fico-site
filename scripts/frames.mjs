/**
 * Il film come sequenza di fotogrammi.
 *
 * Perché non più il video: lo scrub di un <video> chiede al browser di cercare
 * un punto e decodificarlo a ogni scatto di rotella, e il risultato va a
 * strappi. Una sequenza di immagini disegnate su canvas non decodifica nulla
 * mentre si scorre: si sceglie il fotogramma e lo si disegna. Tra un
 * fotogramma e il successivo si fa una dissolvenza, così dodici al secondo
 * bastano a dare un movimento continuo.
 *
 * Si parte dai due clip ORIGINALI: il master mp4 ricodificato aveva perso
 * qualità (gradienti a blocchi nelle zone scure). Una leggera pulizia del
 * rumore e un filo di nitidezza tolgono la grana senza impastare i bordi.
 *
 * Due serie:
 *   d  1280×720 fotogramma intero — schermi orizzontali
 *   p  540×720 ritaglio centrale — telefoni in verticale, dove del fotogramma
 *      intero si vedrebbe comunque solo la fascia centrale
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import ffmpegPath from "ffmpeg-static";

const CLIP_A = "/Users/cesarecicogna/Documents/sito FICO/video/Agent Video - Image 1 depicts the dark architectural lobby location_ its curved black-green marble w.mp4";
const CLIP_B = "/Users/cesarecicogna/Downloads/Agent Video - Image 1 depicts the unbranded luxury product object on its pedestal_Image 2 depicts th.mp4";

export const FPS = 12;
const CLEAN = "hqdn3d=2:1.5:4:3,unsharp=5:5:0.35:5:5:0";

mkdirSync(".tmp", { recursive: true });
const list = ".tmp/frames-list.txt";
writeFileSync(list, [CLIP_A, CLIP_B].map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n") + "\n");

const SETS = [
  { name: "d", vf: `fps=${FPS},${CLEAN}`, quality: 80 },
  { name: "p", vf: `fps=${FPS},${CLEAN},crop=540:720:(iw-540)/2:0`, quality: 76 },
];

for (const set of SETS) {
  const dir = `public/film/${set.name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  execFileSync(ffmpegPath, [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "concat", "-safe", "0", "-i", list,
    "-vf", set.vf,
    "-an", "-c:v", "libwebp", "-quality", String(set.quality), "-compression_level", "6",
    "-start_number", "0",
    `${dir}/%04d.webp`,
  ], { stdio: "inherit" });

  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
  const bytes = files.reduce((s, f) => s + statSync(`${dir}/${f}`).size, 0);
  console.log(`serie ${set.name}: ${files.length} fotogrammi, ${(bytes / 1048576).toFixed(1)} MB`);
}

const count = readdirSync("public/film/d").filter((f) => f.endsWith(".webp")).length;
writeFileSync(
  "src/lib/frames.json",
  JSON.stringify({ fps: FPS, count, sets: { d: { w: 1280, h: 720, x: 0 }, p: { w: 540, h: 720, x: 370 } } }, null, 2) + "\n",
);
rmSync(list, { force: true });
console.log("src/lib/frames.json aggiornato");
