# FICO — websites for a brighter tomorrow

Sito immersivo dello studio FICO. Non è un sito con un video di sfondo: il film
**è** la prima parte del sito, scorre sotto il dito dell'utente e alla fine si
trasforma nella pagina vera senza che si veda uno stacco.

Next.js 16 · React 19 · TypeScript · GSAP ScrollTrigger · Lenis · export statico.

---

## Avvio

```bash
npm run dev
```

Poi <http://localhost:3000>.

```bash
npm run build
```

Genera `out/`: file statici, pubblicabili su qualsiasi hosting (Vercel, Netlify,
GitHub Pages) senza un server Node.

---

## Il film

I due clip Runway sono stati uniti in un file solo, `public/video/fico-film.mp4`,
40,13 secondi a 24 fps. La giunzione è invisibile perché il primo clip finisce
sulla seta verde su cui il secondo comincia.

**Perché sono stati riencodati.** I sorgenti avevano un keyframe ogni 58 e ogni
128 fotogrammi. Lo scrub allo scroll chiede continuamente `currentTime`: ogni
richiesta costringe il decoder a ripartire dal keyframe precedente, quindi con
GOP così lunghi l'immagine si muove a scatti. I master hanno un keyframe ogni 6
fotogrammi (un quarto di secondo).

| file | uso | peso |
|---|---|---|
| `fico-film.mp4` | 1280×720, desktop | 12,6 MB |
| `fico-film-mobile.mp4` | 854×480, dispositivi leggeri | 3,0 MB |

Per rigenerare tutto dai sorgenti:

```bash
node scripts/media.mjs     # monta, riencoda, poster, logo della giuntura, audio
node scripts/stills.mjs    # fotogrammi per "Selected worlds", favicon, og
node scripts/split-logo.mjs   # marchio, parola e lockup su fondo trasparente
```

I percorsi dei sorgenti stanno in cima a `scripts/media.mjs`.

---

## Come funziona lo scrub

`src/animations/videoScrub.ts`. Tre accorgimenti fanno la differenza fra fluido
e a scatti:

1. **inerzia** — il tempo obiettivo viene inseguito con interpolazione smorzata,
   così l'immagine non salta da un valore all'altro;
2. **un seek alla volta** — finché il precedente non emette `seeked` non se ne
   chiede un altro, altrimenti il browser accoda le richieste e l'immagine si
   pianta;
3. **mai oltre il buffer** — il tempo richiesto è limitato a quanto è già
   scaricato, quindi non si finisce mai su un fotogramma inesistente.

Su desktop la soglia di seek è mezzo fotogramma; sui dispositivi leggeri è
0,22 s e si usa il file piccolo: passo più grosso, decoder non ingolfato.

---

## La giuntura fra film e sito

È la parte più delicata e i suoi numeri non sono stimati, sono misurati
(`scripts/measure-seam.mjs`):

- l'avorio dell'ultimo fotogramma è **`#FCF4DD`** ed è il colore di tutte le
  sezioni chiare del sito;
- il logo nel fotogramma sta al **49,88 % / 49,24 %** ed è largo il **20,78 %**
  della larghezza del fotogramma.

`seam-logo.png` è ritagliato **dall'ultimo fotogramma del film**, non dal file
del logo, così combacia pixel per pixel. A schermo viene posizionato ricalcolando
il ritaglio `object-fit: cover` a ogni ridimensionamento (`placeSeamLogo`).

Il risultato: negli ultimi 1,2 secondi lo strato avorio del DOM sale da 0 a 1
sopra un video che mostra già esattamente quella stessa immagine. Non c'è nessun
taglio da vedere.

---

## Struttura

```
src/
  animations/
    scroll.ts        Lenis + ScrollTrigger, rilevamento dispositivo e motion
    videoScrub.ts    il motore dello scrub
  components/        una cartella piatta, un file CSS module per componente
  lib/
    film.ts          la sceneggiatura: tempi, testi, posizioni, dati giuntura
    useReveal.ts     ingressi sobri degli elementi
scripts/             pipeline dei media (non gira in fase di build)
```

I testi del film si cambiano in **`src/lib/film.ts`**: ogni capitolo ha quattro
tempi (comparsa, piena leggibilità, inizio uscita, uscita) e una posizione in
pagina. Non serve toccare le animazioni.

---

## Accessibilità e prestazioni

- `prefers-reduced-motion`: niente pin, niente scrub, niente puntatore
  personalizzato. Il film diventa un fotogramma fermo e i capitoli si leggono in
  colonna.
- La navigazione misura a ogni scroll quale superficie ha sotto di sé e passa da
  avorio a verde scuro da sola: le sezioni si dichiarano con `data-surface`.
- Il caricamento non aspetta l'intero film: parte appena il video può iniziare, e
  comunque entro 9 secondi.
- La musica non parte da sola. È un pulsante in barra: i browser bloccano
  l'audio automatico e sarebbe comunque sgradevole.

---

## Da sistemare prima di pubblicare

- Il **dominio** è ancora `https://fico.studio` in `src/app/layout.tsx`
  (`SITE`): serve per canonical e anteprime social, va messo quello vero.
  L'indirizzo email è `ficolc78@gmail.com`, già corretto ovunque.
- Il modulo di contatto non esiste: i pulsanti aprono il client di posta.
- "Selected worlds" elenca **settori**, non clienti, e il testo lo dice: finché
  non ci sono lavori veri non va trasformato in un portfolio.
