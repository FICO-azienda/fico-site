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

Il film non è un `<video>`: è una **sequenza di 481 fotogrammi** (12 al secondo
per 40 secondi) disegnata su canvas, in `public/film/`.

**Perché.** Lo scrub di un video chiede al browser di cercare un punto e
decodificarlo a ogni scatto di rotella: il risultato va a strappi, e ricodificare
il master per renderlo più scorrevole ne peggiorava la qualità. Con i fotogrammi
non si decodifica nulla mentre si scorre — si sceglie quale disegnare — e fra un
fotogramma e il successivo c'è una dissolvenza proporzionale alla posizione,
così dodici al secondo danno un movimento continuo. Disegnare costa meno di 5 ms
per fotogramma, contro i 16,7 del limite per i 60 fps.

| serie | misura | uso | peso |
|---|---|---|---|
| `d` | 1280×720 intero | schermi orizzontali | 16 MB |
| `p` | 540×720 ritaglio centrale | telefoni in verticale | 7 MB |

Il caricamento è a pettine: prima un fotogramma al secondo su tutto il film,
poi due, quattro, dodici. Il film è scorribile quasi subito e si affina mentre
arriva il resto.

I fotogrammi vengono dai **clip originali**, con una leggera pulizia del rumore:

```bash
node scripts/frames.mjs
```

Il master mp4 resta in `media/` come sorgente di lavoro per gli altri script, ma
il sito non lo scarica.

## La giuntura fra film e sito

È la parte più delicata e i suoi numeri non sono stimati, sono misurati
(`scripts/measure-seam.mjs`):

- l'avorio dell'ultimo fotogramma è **`#FCF4DD`** ed è il colore di tutte le
  sezioni chiare del sito;
- il logo nel fotogramma sta al **49,88 % / 49,24 %** ed è largo il **20,78 %**
  della larghezza del fotogramma.

Il logo del sito viene posizionato con **la stessa funzione che disegna i
fotogrammi** (`project` in `src/animations/frameScrub.ts`), ricalcolata a ogni
cambio di misura del riquadro. Le costanti di centro in `src/lib/film.ts` sono
state corrette misurando i pixel del fotogramma finale contro il logo del sito:
lo scarto residuo è di pochi pixel, dovuto al fatto che nel logo generato da
Runway marchio e parola sono appena più vicini che nel file originale.

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
