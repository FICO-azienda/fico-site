import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * Il puntatore come punto di interesse: posizione sul piano virtuale,
 * velocita' mediata e i due giudizi che servono alla regia — "sta fermo"
 * e "si sta agitando" — entrambi con isteresi, non su un singolo fotogramma.
 */
export class Puntatore {
  constructor(camera, dominio) {
    this.camera = camera;
    this.piano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.raycaster = new THREE.Raycaster();

    this.ndc = new THREE.Vector2();
    this.punto = new THREE.Vector3();        // posizione sul piano, in metri
    this.haPunto = false;

    this.velocita = 0;                        // px/s, media mobile esponenziale
    this.fermoDa = 0;                         // s di immobilita' continua
    this.agitatoDa = 0;                       // s di agitazione continua
    this.dentro = false;

    this._ultimo = new THREE.Vector2();
    this._primoEvento = true;
    this._tempoUltimo = performance.now();

    this._muovi = (e) => this._registra(e.clientX, e.clientY);
    this._esci = () => { this.dentro = false; };
    dominio.addEventListener('pointermove', this._muovi, { passive: true });
    dominio.addEventListener('pointerleave', this._esci, { passive: true });
  }

  _registra(x, y) {
    const ora = performance.now();
    const dt = Math.max((ora - this._tempoUltimo) / 1000, 1 / 240);
    this._tempoUltimo = ora;
    this.dentro = true;

    if (this._primoEvento) {
      this._ultimo.set(x, y);
      this._primoEvento = false;
    }
    const dist = Math.hypot(x - this._ultimo.x, y - this._ultimo.y);
    const istantanea = dist / dt;
    const k = CONFIG.mouseSpeedSmoothing;
    this.velocita += (istantanea - this.velocita) * k;
    this._ultimo.set(x, y);

    this.ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.haPunto = !!this.raycaster.ray.intersectPlane(this.piano, this.punto);
  }

  /** Va chiamato ogni frame: la velocita' decade anche quando il mouse e' fermo. */
  aggiorna(dt) {
    const fermoDaTroppo = performance.now() - this._tempoUltimo > 90;
    if (fermoDaTroppo) this.velocita += (0 - this.velocita) * Math.min(1, dt * 8);

    if (this.velocita < CONFIG.stillnessThreshold) this.fermoDa += dt;
    else this.fermoDa = 0;

    if (this.velocita > CONFIG.mouseSpeedThreshold) this.agitatoDa += dt;
    else this.agitatoDa = Math.max(0, this.agitatoDa - dt * 1.5); // rientra, ma non di colpo
  }

  eFermo() { return this.fermoDa >= CONFIG.stillnessDuration; }
  eAgitato() { return this.agitatoDa >= CONFIG.mouseFastDuration; }

  dispose(dominio) {
    dominio.removeEventListener('pointermove', this._muovi);
    dominio.removeEventListener('pointerleave', this._esci);
  }
}
