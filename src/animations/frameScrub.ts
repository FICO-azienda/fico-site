/**
 * Il film disegnato su canvas, un fotogramma alla volta.
 *
 * Tre scelte tengono lo scorrimento fluido:
 *  1. nessuna decodifica video mentre si scorre: i fotogrammi sono immagini già
 *     pronte, si sceglie quale disegnare;
 *  2. fra un fotogramma e il successivo c'è una dissolvenza proporzionale alla
 *     posizione, quindi dodici fotogrammi al secondo danno un movimento continuo;
 *  3. il caricamento è "a pettine": prima un fotogramma al secondo su tutto il
 *     film, poi due, quattro, dodici. Il film è scorribile quasi subito e si
 *     affina mentre arriva il resto.
 */
import FRAMES from "@/lib/frames.json";

export type SetKey = "d" | "p";

export interface FrameSet {
  key: SetKey;
  /** misure dell'immagine di questa serie */
  w: number;
  h: number;
  /** dove comincia, in orizzontale, dentro il fotogramma intero 1280×720 */
  x: number;
}

export interface FrameScrub {
  set: FrameSet;
  setTarget: (seconds: number) => void;
  time: () => number;
  /**
   * Da un punto del fotogramma intero (coordinate 1280×720) alla posizione a
   * schermo, in px CSS relativi al canvas. Il logo della giuntura usa la stessa
   * funzione del disegno: così i due combaciano per costruzione.
   */
  project: (fx: number, fy: number) => { x: number; y: number; scale: number };
  /** quanti fotogrammi sono pronti */
  loaded: () => number;
  destroy: () => void;
}

interface Options {
  /** a ogni fotogramma disegnato, con il tempo già smorzato */
  onFrame?: (time: number) => void;
  /** il film è pronto per essere mostrato */
  onReady?: () => void;
  damping?: number;
}

const FULL_W = 1280;
const FULL_H = 720;
const CONCURRENCY = 6;

/** telefoni in verticale: del fotogramma intero si vedrebbe solo la fascia centrale */
export function pickSet(width: number, height: number): FrameSet {
  const key: SetKey = width / Math.max(1, height) < 0.75 ? "p" : "d";
  const s = FRAMES.sets[key];
  return { key, w: s.w, h: s.h, x: s.x };
}

/** ordine di caricamento a pettine: 12, 6, 3, poi tutti gli altri */
function combOrder(count: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [12, 6, 3, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

export function createFrameScrub(canvas: HTMLCanvasElement, opts: Options = {}): FrameScrub {
  const { onFrame, onReady, damping = 0.12 } = opts;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const { fps, count } = FRAMES;
  const set = pickSet(canvas.clientWidth, canvas.clientHeight);

  const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
  let alive = true;
  let target = 0;
  let current = 0;
  let raf = 0;
  let lastKey = "";
  let readyFired = false;

  /* ------------------------------------------------------------ caricamento */
  const order = combOrder(count);
  const firstPass = Math.ceil(count / 12) + 1;
  let cursor = 0;
  let loaded = 0;
  let inFlight = 0;

  const src = (i: number) => `/film/${set.key}/${String(i).padStart(4, "0")}.webp`;

  const pump = () => {
    while (alive && inFlight < CONCURRENCY && cursor < order.length) {
      const i = order[cursor++];
      inFlight++;
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      const done = () => {
        inFlight--;
        if (!alive) return;
        if (img.naturalWidth) {
          images[i] = img;
          loaded++;
          lastKey = ""; // un fotogramma nuovo può migliorare quello mostrato
        }
        // il film è mostrabile quando c'è una copertura di un fotogramma al secondo
        if (!readyFired && images[0] && loaded >= Math.min(firstPass, count)) {
          readyFired = true;
          onReady?.();
        }
        pump();
      };
      // decode() prepara l'immagine fuori dal thread principale: al primo
      // disegno non c'è la pausa della decodifica
      img.onload = () => void img.decode().catch(() => {}).finally(done);
      img.onerror = done;
    }
  };
  pump();

  /* --------------------------------------------------------------- misure */
  const cssSize = () => ({ w: canvas.clientWidth || 1, h: canvas.clientHeight || 1 });

  const resizeBacking = () => {
    const { w, h } = cssSize();
    // densità massima 2 e un tetto sui pixel totali: oltre non si vede differenza
    // (la sorgente è a 720p) ma il disegno costa di più
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w * h * dpr * dpr > 4_200_000) dpr = Math.sqrt(4_200_000 / (w * h));
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      lastKey = "";
    }
  };

  const project = (fx: number, fy: number) => {
    const { w, h } = cssSize();
    const scale = Math.max(w / set.w, h / set.h);
    return {
      x: w / 2 + (fx - (set.x + set.w / 2)) * scale,
      y: h / 2 + (fy - set.h / 2) * scale,
      scale,
    };
  };

  /* --------------------------------------------------------------- disegno */
  const nearestBelow = (i: number) => {
    for (let k = i; k >= Math.max(0, i - 24); k--) if (images[k]) return k;
    return -1;
  };
  const nearestAbove = (i: number) => {
    for (let k = i; k <= Math.min(count - 1, i + 24); k++) if (images[k]) return k;
    return -1;
  };

  const drawImage = (img: HTMLImageElement, alpha: number) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  };

  const render = () => {
    const pos = Math.max(0, Math.min(count - 1, current * fps));
    const base = Math.floor(pos);
    const a = nearestBelow(base);
    const b = nearestAbove(Math.min(count - 1, base + 1));

    let first = a;
    let second = -1;
    let mix = 0;
    if (a === -1) first = b;
    else if (b !== -1 && b !== a) {
      second = b;
      mix = (pos - a) / (b - a);
    }
    if (first === -1) return;

    // si ridisegna solo se cambia qualcosa di visibile
    const key = `${first}|${second}|${Math.round(mix * 60)}|${canvas.width}x${canvas.height}`;
    if (key === lastKey) return;
    lastKey = key;

    drawImage(images[first]!, 1);
    if (second !== -1 && mix > 0.01) drawImage(images[second]!, Math.min(1, mix));
    ctx.globalAlpha = 1;
  };

  const tick = () => {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const delta = target - current;
    current += Math.abs(delta) < 0.0005 ? delta : delta * damping;
    render();
    onFrame?.(current);
  };

  const ro = new ResizeObserver(() => {
    resizeBacking();
    render();
  });
  ro.observe(canvas);
  resizeBacking();
  raf = requestAnimationFrame(tick);

  return {
    set,
    setTarget: (s) => {
      target = s;
    },
    time: () => current,
    project,
    loaded: () => loaded,
    destroy: () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    },
  };
}

export const FILM_FULL = { w: FULL_W, h: FULL_H };
