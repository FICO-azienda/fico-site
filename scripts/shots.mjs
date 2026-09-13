/**
 * Catture del sito di un cliente per il portfolio.
 *
 * Si punta al sito dal vivo, non ai file locali: quello che finisce in vetrina
 * è esattamente ciò che vede un visitatore. Prima di scattare si scorre la
 * pagina e si torna su, altrimenti le animazioni legate allo scroll lasciano
 * mezzo contenuto invisibile.
 */
import puppeteer from "puppeteer";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const BASE = "https://fico-azienda.github.io/cerariacicogna";
const OUT = "public/img/work/cereria";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["storia", "/chi-siamo.html"],
  ["garden", "/garden.html"],
  ["collection", "/home-collection.html"],
  ["liturgico", "/liturgico.html"],
  ["contatti", "/contatti.html"],
];

const settle = async (page) => {
  await page.evaluate(async () => {
    // sveglia le animazioni legate allo scorrimento, poi torna in cima
    window.scrollTo(0, document.body.scrollHeight * 0.4);
    await new Promise((r) => setTimeout(r, 700));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
  await new Promise((r) => setTimeout(r, 900));
};

const browser = await puppeteer.launch({ headless: true });

for (const [name, path] of PAGES) {
  for (const [kind, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 60000 });
    await settle(page);
    const buf = await page.screenshot({ type: "png" });
    await sharp(buf)
      .resize({ width: kind === "desktop" ? 1600 : 600 })
      .webp({ quality: 82, effort: 6 })
      .toFile(`${OUT}/${name}-${kind}.webp`);
    await page.close();
    console.log(`${name} ${kind}`);
  }
}

await browser.close();
console.log("fatto");
