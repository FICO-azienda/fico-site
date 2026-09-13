# FICO — websites for a brighter tomorrow

Sito immersivo dello studio FICO. Non è un sito con un video di sfondo: il film
**è** la prima parte del sito, scorre sotto il dito dell'utente e alla fine si
trasforma nella pagina vera senza che si veda uno stacco.

Next.js 16 · React 19 · TypeScript · GSAP ScrollTrigger · Lenis · italiano e inglese.

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
node scripts/stills.mjs    # fotogrammi per i settori, favicon, og
node scripts/split-logo.mjs   # marchio, parola e lockup su fondo trasparente
```

## Catture dei siti dei clienti

Le schermate in vetrina non sono mockup: sono catture del sito **dal vivo**,
generate con un browser senza interfaccia.

```bash
node scripts/shots.mjs
```

Punta all'indirizzo pubblico del sito, scorre la pagina e torna in cima prima
di scattare — altrimenti le animazioni legate allo scroll lasciano mezzo
contenuto invisibile — e salva desktop (1600px) e telefono (600px) in
`public/img/work/<cliente>/`. Per un nuovo cliente si cambiano `BASE` e l'elenco
delle pagine in cima allo script.

Il logo del cliente si prepara con `node scripts/client-logo.mjs`. Attenzione a
un dettaglio che costa tempo: alcuni file **hanno già la trasparenza**, con il
nero sotto i pixel invisibili. Scontornarli presumendo un fondo bianco rende
opaco quel nero e il logo finisce dentro un riquadro scuro. Lo script controlla
prima se l'alpha c'è e in quel caso non lo tocca.

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

- **Dominio.** Manca. Serve per due cose: l'indirizzo del sito (ora c'è il
  segnaposto `fico.studio`, in `NEXT_PUBLIC_SITE_URL`) e la verifica su Resend,
  senza la quale le email di conferma finiscono in spam.
- **Informativa privacy.** È una bozza costruita su come funziona il sito oggi
  e lo dichiara apertamente in cima alla pagina. Mancano denominazione legale,
  forma giuridica, partita IVA e sede. Va fatta verificare da un professionista.
- **Nessun tracciamento installato**, quindi nessun banner cookie. Se un giorno
  si aggiunge un sistema di statistiche, servirà entrambi.
- **Cereria Cicogna**: l'indirizzo del sito nel caso studio è quello di GitHub
  Pages. Se il progetto passa a un dominio proprio, va aggiornato in
  `src/data/projects.ts`.
- Il paragrafo **«Risultato»** del caso studio è volutamente assente: non ci
  sono ancora numeri veri e non ne sono stati inventati.
