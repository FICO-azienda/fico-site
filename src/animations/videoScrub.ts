/**
 * Scrub del video sullo scroll.
 *
 * Tre accorgimenti fanno la differenza tra "fluido" e "a scatti":
 *  1. il tempo obiettivo viene inseguito con un'interpolazione smorzata, cosi'
 *     l'immagine ha una leggera inerzia invece di saltare da un valore all'altro;
 *  2. non si chiede un nuovo seek finche' il precedente non e' concluso
 *     (`seeked`), altrimenti il browser accoda le richieste e l'immagine si blocca;
 *  3. il tempo richiesto non supera mai la parte gia' bufferizzata, quindi lo
 *     scorrimento non finisce mai su un fotogramma che non esiste ancora.
 */

export interface ScrubHandle {
  /** secondo del film verso cui tendere */
  setTarget: (seconds: number) => void;
  /** tempo mostrato in questo istante, gia' smorzato */
  time: () => number;
  /** fino a che secondo il video e' scaricato */
  buffered: () => number;
  destroy: () => void;
}

export interface ScrubOptions {
  /** quanto l'immagine insegue lo scroll: piu' basso, piu' inerzia */
  damping?: number;
  /** scarto minimo, in secondi, sotto il quale non si chiede un nuovo seek */
  threshold?: number;
}

export function createVideoScrub(
  video: HTMLVideoElement,
  onFrame?: (time: number) => void,
  { damping = 0.14, threshold = 0.02 }: ScrubOptions = {},
): ScrubHandle {
  let target = 0;
  let current = 0;
  let seeking = false;
  let raf = 0;
  let alive = true;

  const onSeeked = () => {
    seeking = false;
  };
  video.addEventListener("seeked", onSeeked);

  const bufferedEnd = () => {
    const b = video.buffered;
    for (let i = 0; i < b.length; i++) {
      if (current >= b.start(i) - 0.25 && current <= b.end(i) + 0.25) return b.end(i);
    }
    return b.length ? b.end(b.length - 1) : 0;
  };

  const tick = () => {
    if (!alive) return;
    raf = requestAnimationFrame(tick);

    const delta = target - current;
    current += Math.abs(delta) < 0.0008 ? delta : delta * damping;

    const limit = Math.max(0, Math.min(bufferedEnd(), video.duration || 0));
    const wanted = Math.max(0, Math.min(current, limit));

    // sotto la soglia un nuovo seek non cambierebbe nulla di visibile
    if (!seeking && Math.abs(video.currentTime - wanted) > threshold) {
      seeking = true;
      try {
        video.currentTime = wanted;
      } catch {
        seeking = false;
      }
    }
    onFrame?.(current);
  };

  video.pause();
  raf = requestAnimationFrame(tick);

  return {
    setTarget: (s) => {
      target = s;
    },
    time: () => current,
    buffered: bufferedEnd,
    destroy: () => {
      alive = false;
      cancelAnimationFrame(raf);
      video.removeEventListener("seeked", onSeeked);
    },
  };
}
