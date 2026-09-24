import { DEV } from './config.js';

/** Pannello di sviluppo: piccolo, in alto a destra, rimovibile con dispose(). */
export class Debug {
  constructor() {
    this.attivo = DEV;
    if (!this.attivo) return;

    this.el = document.createElement('div');
    this.el.className = 'debug';
    this.el.innerHTML = '<b>debug</b><div id="dbg-corpo"></div><button id="dbg-off">nascondi</button>';
    document.body.appendChild(this.el);
    this.corpo = this.el.querySelector('#dbg-corpo');
    this.el.querySelector('#dbg-off').onclick = () => this.dispose();

    this._frame = 0;
    this._t = performance.now();
    this._fps = 0;
    this._accumulo = 0;
  }

  aggiorna(dt, dati) {
    if (!this.attivo) return;
    this._frame++;
    const ora = performance.now();
    if (ora - this._t >= 500) {
      this._fps = Math.round((this._frame * 1000) / (ora - this._t));
      this._frame = 0; this._t = ora;
    }
    this._accumulo += dt;
    if (this._accumulo < 0.1) return;   // il pannello non deve costare piu' della scena
    this._accumulo = 0;

    const r = (n, d = 2) => Number(n).toFixed(d);
    this.corpo.innerHTML = `
      <div><span>state</span><span>${dati.stato}</span></div>
      <div><span>animation</span><span>${dati.clip || '—'}</span></div>
      <div><span>mouse vel</span><span>${Math.round(dati.velocitaMouse)} px/s</span></div>
      <div><span>fermo da</span><span>${r(dati.fermoDa, 1)} s</span></div>
      <div><span>agitato da</span><span>${r(dati.agitatoDa, 1)} s</span></div>
      <div><span>distanza</span><span>${r(dati.distanza)} m</span></div>
      <div><span>target</span><span>${dati.target}</span></div>
      <div><span>deer pos</span><span>${r(dati.posizione.x)}, ${r(dati.posizione.z)}</span></div>
      <div><span>deer rot</span><span>${r((dati.rotazione * 180) / Math.PI, 0)}°</span></div>
      <div><span>fps</span><span>${this._fps}</span></div>`;
  }

  dispose() {
    if (!this.attivo) return;
    this.el.remove();
    this.attivo = false;
  }
}
