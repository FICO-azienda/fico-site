/**
 * Macchina a stati dell'intro. Uno stato per volta, transizioni dichiarate:
 * niente flag booleani sparsi che si contraddicono a vicenda.
 */
export const STATI = {
  LOADING: 'LOADING',
  IDLE: 'IDLE',
  FOLLOWING: 'FOLLOWING',
  SITTING: 'SITTING',
  FIG_GROWING: 'FIG_GROWING',
  FIG_RIPENING: 'FIG_RIPENING',
  FRUIT_FALLING: 'FRUIT_FALLING',
  APPROACHING_FRUIT: 'APPROACHING_FRUIT',
  EATING: 'EATING',
  COMPLETE: 'COMPLETE'
};

/** Transizioni ammesse: tutto il resto e' un errore di logica, e va detto. */
const AMMESSE = {
  LOADING: ['IDLE'],
  IDLE: ['FOLLOWING', 'FIG_GROWING', 'SITTING'],
  FOLLOWING: ['IDLE', 'SITTING', 'FIG_GROWING'],
  SITTING: ['IDLE', 'FIG_GROWING'],
  FIG_GROWING: ['FIG_RIPENING'],
  FIG_RIPENING: ['FRUIT_FALLING'],
  FRUIT_FALLING: ['APPROACHING_FRUIT'],
  APPROACHING_FRUIT: ['EATING'],
  EATING: ['COMPLETE'],
  COMPLETE: []
};

/** Dal germoglio in poi il cursore non conta piu' nulla. */
export const IGNORA_CURSORE = new Set([
  STATI.FIG_GROWING, STATI.FIG_RIPENING, STATI.FRUIT_FALLING,
  STATI.APPROACHING_FRUIT, STATI.EATING, STATI.COMPLETE
]);

export class Macchina {
  constructor(iniziale = STATI.LOADING) {
    this.stato = iniziale;
    this.tempoNelloStato = 0;
    this.ascoltatori = new Set();
  }

  /** true se la transizione e' avvenuta. */
  vai(nuovo) {
    if (nuovo === this.stato) return false;
    if (!AMMESSE[this.stato]?.includes(nuovo)) {
      console.warn(`[stato] transizione non prevista: ${this.stato} -> ${nuovo}`);
      return false;
    }
    const vecchio = this.stato;
    this.stato = nuovo;
    this.tempoNelloStato = 0;
    for (const f of this.ascoltatori) f(nuovo, vecchio);
    return true;
  }

  e(...stati) { return stati.includes(this.stato); }
  ignoraCursore() { return IGNORA_CURSORE.has(this.stato); }
  aggiorna(dt) { this.tempoNelloStato += dt; }
  osserva(f) { this.ascoltatori.add(f); return () => this.ascoltatori.delete(f); }
}
