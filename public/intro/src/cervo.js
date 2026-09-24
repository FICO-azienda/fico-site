import * as THREE from 'three';
import { CONFIG } from './config.js';

const AVANTI_LOCALE = new THREE.Vector3(1, 0, 0); // il muso del modello guarda verso +X

/**
 * Il cervo: un contenitore che si sposta nel mondo e uno scheletro che si
 * anima. La posizione globale sta sempre sul contenitore, mai sulla root
 * motion della clip, cosi' non viene applicata due volte.
 */
export class Cervo {
  constructor(gltf, scena) {
    this.contenitore = new THREE.Group();
    this.radice = gltf.scene;
    this.radice.scale.setScalar(CONFIG.modelScale);
    this.contenitore.add(this.radice);
    scena.add(this.contenitore);

    this.mixer = new THREE.AnimationMixer(this.radice);
    this.finite = new Set();            // nomi delle clip a esecuzione singola gia' concluse
    this.mixer.addEventListener('finished', (e) => {
      const nome = e.action.getClip().name;
      this.finite.add(nome);
    });
    this.clips = new Map(gltf.animations.map((c) => [c.name, c]));
    this.azione = null;
    this.clipCorrente = '';

    this.velocita = 0;            // m/s scalare, lungo la direzione del corpo
    this.angolo = 0;              // rad, imbardata corrente
    this.sterzata = 0;            // rad, scarto fra dove guarda e dove vuole andare
    this.andatura = 'F';          // F | L | R, con isteresi
    this._tempoAndatura = 0;

    // vettori riusati: nel loop non si allocano oggetti
    this._v = new THREE.Vector3();
    this._d = new THREE.Vector3();

    this.radice.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.material = new THREE.MeshStandardMaterial({
          color: CONFIG.deerColor, roughness: 0.74, metalness: 0
        });
      }
    });
  }

  get posizione() { return this.contenitore.position; }

  /** Una clip per volta, con incrocio morbido. */
  suona(nome, { loop = true, crossfade = CONFIG.animationCrossfade } = {}) {
    if (nome === this.clipCorrente) return this.azione;
    const clip = this.clips.get(nome);
    if (!clip) { console.warn('[cervo] clip assente:', nome); return null; }

    const nuova = this.mixer.clipAction(clip);
    this.finite.delete(nome);
    nuova.reset();
    nuova.enabled = true;
    nuova.setEffectiveWeight(1);
    nuova.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    nuova.clampWhenFinished = !loop;

    if (this.azione && this.azione !== nuova) {
      this.azione.crossFadeTo(nuova, crossfade, false);
      nuova.play();
    } else {
      nuova.fadeIn(crossfade).play();
    }
    this.azione = nuova;
    this.clipCorrente = nome;
    return nuova;
  }

  /** true quando una clip a esecuzione singola ha terminato la sua corsa. */
  haFinito(nome = this.clipCorrente) { return this.finite.has(nome); }

  /** Frazione della clip corrente gia' riprodotta, 0-1. */
  progressoClip() {
    if (!this.azione) return 0;
    const d = this.azione.getClip().duration;
    if (!d) return 0;
    // con LoopOnce il tempo si ferma alla fine: il modulo lo riporterebbe a zero
    const inCiclo = this.azione.loop === THREE.LoopRepeat;
    return inCiclo ? (this.azione.time % d) / d : Math.min(this.azione.time / d, 1);
  }

  /**
   * Insegue un punto con accelerazione, inerzia e rotazione progressiva.
   * Ritorna la distanza residua sul piano.
   */
  insegui(target, dt, { fermati = false, soglia = CONFIG.stopDistance } = {}) {
    const p = this.contenitore.position;
    this._d.set(target.x - p.x, 0, target.z - p.z);
    const distanza = this._d.length();

    // quanto deve girare per puntare il target
    if (distanza > 1e-4) {
      const voluto = Math.atan2(-this._d.z, this._d.x);
      let scarto = voluto - this.angolo;
      while (scarto > Math.PI) scarto -= Math.PI * 2;
      while (scarto < -Math.PI) scarto += Math.PI * 2;
      this.sterzata = scarto;
      const passo = Math.sign(scarto) * Math.min(Math.abs(scarto), CONFIG.rotationSpeed * dt);
      this.angolo += passo;
      this.contenitore.rotation.y = this.angolo;
    } else {
      this.sterzata = 0;
    }

    // velocita': accelera verso il target, frena quando e' arrivato o deve girare molto
    const arrivato = fermati || distanza <= soglia;
    const dritto = Math.max(0, Math.cos(this.sterzata)); // se e' girato di traverso, rallenta
    const desiderata = arrivato ? 0 : CONFIG.followSpeed * (distanza < CONFIG.slowWalkDistance ? 0.55 : 1) * dritto;

    if (desiderata > this.velocita) {
      this.velocita = Math.min(desiderata, this.velocita + CONFIG.acceleration * dt);
    } else {
      this.velocita = Math.max(desiderata, this.velocita - CONFIG.deceleration * dt);
    }

    if (this.velocita > 1e-4) {
      this._v.copy(AVANTI_LOCALE).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.angolo);
      p.addScaledVector(this._v, this.velocita * dt);
    }
    return distanza;
  }

  /** Sceglie la clip di camminata in base a distanza e sterzata, con isteresi. */
  aggiornaAndatura(distanza, dt, { immobile = false } = {}) {
    this._tempoAndatura += dt;

    if (immobile || this.velocita < 0.06) {
      if (this.clipCorrente !== 'Deer_Idle') this.suona('Deer_Idle');
      return;
    }

    // direzione della curva: si cambia solo oltre soglia, si torna dritti sotto un'altra
    const s = Math.abs(this.sterzata);
    let direzione = this.andatura;
    if (s > CONFIG.turnThreshold) direzione = this.sterzata > 0 ? 'L' : 'R';
    else if (s < CONFIG.turnRelease) direzione = 'F';

    const ritmo = distanza > CONFIG.slowWalkDistance ? 'A_WalkMedium' : 'A_WalkSlow';
    const nome = `${ritmo}_${direzione}`;

    if (nome !== this.clipCorrente && this._tempoAndatura >= CONFIG.gaitMinHold) {
      this.andatura = direzione;
      this._tempoAndatura = 0;
      this.suona(nome);
    }
  }

  /** Ruota sul posto verso un punto, senza spostarsi. Ritorna lo scarto residuo. */
  orientaVerso(punto, dt) {
    const p = this.contenitore.position;
    this._d.set(punto.x - p.x, 0, punto.z - p.z);
    if (this._d.lengthSq() < 1e-8) return 0;
    const voluto = Math.atan2(-this._d.z, this._d.x);
    let scarto = voluto - this.angolo;
    while (scarto > Math.PI) scarto -= Math.PI * 2;
    while (scarto < -Math.PI) scarto += Math.PI * 2;
    const passo = Math.sign(scarto) * Math.min(Math.abs(scarto), CONFIG.rotationSpeed * 0.8 * dt);
    this.angolo += passo;
    this.contenitore.rotation.y = this.angolo;
    this.sterzata = scarto - passo;
    return Math.abs(this.sterzata);
  }

  frena(dt) {
    this.velocita = Math.max(0, this.velocita - CONFIG.deceleration * dt);
    if (this.velocita > 1e-4) {
      this._v.copy(AVANTI_LOCALE).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.angolo);
      this.contenitore.position.addScaledVector(this._v, this.velocita * dt);
    }
  }

  aggiorna(dt) { this.mixer.update(dt); }

  dispose() {
    this.mixer.stopAllAction();
    this.radice.traverse((o) => {
      if (o.isMesh) { o.geometry?.dispose(); o.material?.dispose(); }
    });
  }
}
