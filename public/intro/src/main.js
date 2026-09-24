import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG, DEV } from './config.js';
import { Macchina, STATI } from './stato.js';
import { Puntatore } from './mouse.js';
import { Cervo } from './cervo.js';
import { Pianta } from './pianta.js';
import { FruttoInCaduta } from './frutto.js';
import { Debug } from './debug.js';

/** Chiamata a rito concluso: qui aprira' il sito vero. */
export function onIntroComplete() { /* niente, per ora */ }

/* -- scena ----------------------------------------------------------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.maxPixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scena = new THREE.Scene();
scena.background = new THREE.Color(CONFIG.ivory);

const camera = new THREE.PerspectiveCamera(CONFIG.cameraFov, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0.5, 1.75, 6.1);
camera.lookAt(0, 1.0, 0);

scena.add(new THREE.HemisphereLight(0xffffff, 0xdad3c4, 1.45));
const chiave = new THREE.DirectionalLight(0xffffff, 1.15);
chiave.position.set(3.2, 5.4, 4.0);
chiave.castShadow = true;
chiave.shadow.mapSize.set(1024, 1024);
chiave.shadow.camera.near = 1;
chiave.shadow.camera.far = 18;
chiave.shadow.camera.left = -5; chiave.shadow.camera.right = 5;
chiave.shadow.camera.top = 5; chiave.shadow.camera.bottom = -5;
chiave.shadow.radius = 4;
chiave.shadow.bias = -0.0012;
scena.add(chiave);
const controluce = new THREE.DirectionalLight(0xffffff, 0.4);
controluce.position.set(-4, 2.4, -3);
scena.add(controluce);

// nessun terreno visibile: solo l'ombra di contatto, che evita l'effetto "galleggia"
const ombra = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.ShadowMaterial({ opacity: 0.13 })
);
ombra.rotation.x = -Math.PI / 2;
ombra.receiveShadow = true;
scena.add(ombra);

/* -- regia ------------------------------------------------------------------ */
const macchina = new Macchina(STATI.LOADING);
const puntatore = new Puntatore(camera, renderer.domElement);
const debug = new Debug();
const orologio = new THREE.Clock();

let cervo = null;
let pianta = null;
let fruttoFisico = null;
let frutto = null;
let tempoRito = 0;          // da quanto l'utente e' nell'intro senza far nascere nulla
let tempoCrescita = 0;
let tempoMaturazione = 0;
let attesaSeduto = 0;
let clipPasto = null;
let faseSeduto = 'ferma';
let completato = false;

const AREA = 3.1;           // il cervo resta dentro questo raggio: fuori uscirebbe di scena
const bersaglio = new THREE.Vector3();
const puntoMangiata = new THREE.Vector3();
const _v = new THREE.Vector3();

const dentroArea = (v) => {
  const d = Math.hypot(v.x, v.z);
  if (d > AREA) { v.x *= AREA / d; v.z *= AREA / d; }
  v.y = 0;
  return v;
};

function nasciPianta(dove) {
  pianta = new Pianta(scena, dentroArea(dove.clone()));
  pianta.gruppo.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  tempoCrescita = 0;
  macchina.vai(STATI.FIG_GROWING);
}

/* -- caricamento ------------------------------------------------------------ */
new GLTFLoader().load('deer.glb', (gltf) => {
  cervo = new Cervo(gltf, scena);
  cervo.radice.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  cervo.contenitore.position.set(-0.9, 0, 0);
  cervo.angolo = -0.35;
  cervo.contenitore.rotation.y = cervo.angolo;
  cervo.suona('Deer_Idle');
  macchina.vai(STATI.IDLE);
  document.body.classList.add('pronto');
}, undefined, (e) => {
  document.getElementById('avviso').textContent = 'Modello non caricato: ' + (e?.message || e);
});

/* -- ciclo ------------------------------------------------------------------ */
let visibile = true;
document.addEventListener('visibilitychange', () => {
  visibile = !document.hidden;
  if (visibile) orologio.getDelta();      // niente salto temporale al ritorno
});

function passo() {
  requestAnimationFrame(passo);
  if (!visibile && !(DEV && window.__forzaRender)) return;   // in sviluppo si puo' misurare anche a pannello nascosto
  aggiornaTutto(Math.min(orologio.getDelta(), 0.05));        // un frame perso non deve teletrasportare nulla
  renderer.render(scena, camera);
}

function aggiornaTutto(dt) {
  macchina.aggiorna(dt);
  puntatore.aggiorna(dt);

  let distanza = 0;
  let nomeBersaglio = '—';

  if (cervo) {
    switch (macchina.stato) {

      case STATI.IDLE: {
        tempoRito += dt;
        cervo.frena(dt);
        cervo.aggiornaAndatura(0, dt, { immobile: true });
        if (puntatore.eFermo() && puntatore.haPunto) { nasciPianta(puntatore.punto); break; }
        if (tempoRito > CONFIG.autoFigTimeout) { nasciPianta(new THREE.Vector3(0.9, 0, 0.4)); break; }
        if (puntatore.haPunto && puntatore.dentro) {
          bersaglio.copy(puntatore.punto); dentroArea(bersaglio);
          if (bersaglio.distanceTo(cervo.posizione) > CONFIG.stopDistance * 1.6) macchina.vai(STATI.FOLLOWING);
        }
        break;
      }

      case STATI.FOLLOWING: {
        tempoRito += dt;
        nomeBersaglio = 'cursore';
        if (puntatore.haPunto) { bersaglio.copy(puntatore.punto); dentroArea(bersaglio); }
        distanza = cervo.insegui(bersaglio, dt);
        cervo.aggiornaAndatura(distanza, dt);

        if (puntatore.eFermo() && puntatore.haPunto) { nasciPianta(puntatore.punto); break; }
        if (tempoRito > CONFIG.autoFigTimeout) { nasciPianta(bersaglio.clone()); break; }
        if (puntatore.eAgitato()) { attesaSeduto = 0; faseSeduto = 'ferma'; macchina.vai(STATI.SITTING); break; }
        if (distanza <= CONFIG.stopDistance) macchina.vai(STATI.IDLE);
        break;
      }

      case STATI.SITTING: {
        tempoRito += dt;
        nomeBersaglio = 'nessuno (disinteresse)';
        cervo.frena(dt);
        attesaSeduto += dt;

        // fasi: si ferma, si accuccia, resta seduto, si rialza. Una alla volta.
        if (faseSeduto === 'ferma' && cervo.velocita < 0.05) {
          cervo.suona('A_StandStraight2Sitting', { loop: false });
          faseSeduto = 'giu';
        } else if (faseSeduto === 'giu' && cervo.haFinito('A_StandStraight2Sitting')) {
          cervo.suona('A_Sitting_2');
          faseSeduto = 'seduto';
          attesaSeduto = 0;               // il tempo da seduto si conta da qui, non da quando si e' fermato
        } else if (faseSeduto === 'seduto' && attesaSeduto > CONFIG.sittingCooldown && !puntatore.eAgitato()) {
          cervo.suona('A_Sitting2StandStraight', { loop: false });
          faseSeduto = 'su';
        } else if (faseSeduto === 'su' && cervo.haFinito('A_Sitting2StandStraight')) {
          cervo.suona('Deer_Idle');
          macchina.vai(STATI.IDLE);
          break;
        }

        if (puntatore.eFermo() && puntatore.haPunto) { nasciPianta(puntatore.punto); break; }
        if (tempoRito > CONFIG.autoFigTimeout) { nasciPianta(new THREE.Vector3(0.9, 0, 0.4)); break; }
        break;
      }

      case STATI.FIG_GROWING: {
        nomeBersaglio = 'pianta';
        tempoCrescita += dt;
        // se era seduto si rialza, poi guarda la pianta crescere
        if (cervo.clipCorrente === 'A_Sitting_2' || cervo.clipCorrente === 'A_StandStraight2Sitting') {
          if (cervo.clipCorrente === 'A_StandStraight2Sitting' ? cervo.haFinito('A_StandStraight2Sitting') : true) {
            cervo.suona('A_Sitting2StandStraight', { loop: false });
          }
        } else if (cervo.clipCorrente === 'A_Sitting2StandStraight') {
          if (cervo.haFinito('A_Sitting2StandStraight')) cervo.suona('Deer_Idle');
        } else if (cervo.clipCorrente !== 'Deer_Idle' && cervo.velocita < 0.05) {
          cervo.suona('Deer_Idle');
        }
        cervo.frena(dt);
        cervo.orientaVerso(pianta.gruppo.position, dt * 0.6);
        pianta.cresci(Math.min(1, tempoCrescita / CONFIG.figGrowthDuration));
        if (tempoCrescita >= CONFIG.figGrowthDuration) { tempoMaturazione = 0; macchina.vai(STATI.FIG_RIPENING); }
        break;
      }

      case STATI.FIG_RIPENING: {
        nomeBersaglio = 'frutto (matura)';
        tempoMaturazione += dt;
        cervo.frena(dt);
        pianta.matura(Math.min(1, tempoMaturazione / CONFIG.figRipeningDuration));
        if (tempoMaturazione >= CONFIG.figRipeningDuration) {
          frutto = pianta.staccaFrutto(scena);
          frutto.castShadow = true;
          fruttoFisico = new FruttoInCaduta(frutto, 0);
          macchina.vai(STATI.FRUIT_FALLING);
        }
        break;
      }

      case STATI.FRUIT_FALLING: {
        nomeBersaglio = 'frutto (cade)';
        cervo.frena(dt);
        if (fruttoFisico.aggiorna(dt)) {
          // il punto davanti al frutto, dalla parte da cui arriva il cervo
          _v.subVectors(cervo.posizione, frutto.position).setY(0).normalize();
          puntoMangiata.copy(frutto.position).addScaledVector(_v, CONFIG.eatStandoff).setY(0);
          macchina.vai(STATI.APPROACHING_FRUIT);
        }
        break;
      }

      case STATI.APPROACHING_FRUIT: {
        nomeBersaglio = 'frutto a terra';
        distanza = cervo.insegui(puntoMangiata, dt, { soglia: 0.08 });
        cervo.aggiornaAndatura(distanza, dt);
        if (distanza <= 0.16) {
          const scarto = cervo.orientaVerso(frutto.position, dt);
          cervo.frena(dt);
          if (cervo.velocita < 0.04 && scarto < 0.12) {
            clipPasto = cervo.suona('A_GrazingOnSpotB_1', { loop: false, crossfade: 0.6 });
            macchina.vai(STATI.EATING);
          }
        }
        break;
      }

      case STATI.EATING: {
        nomeBersaglio = 'pasto';
        cervo.velocita = 0;
        const p = cervo.progressoClip();
        if (frutto && frutto.visible && p >= CONFIG.eatDisappearProgress) frutto.visible = false;
        if (cervo.haFinito('A_GrazingOnSpotB_1')) macchina.vai(STATI.COMPLETE);
        break;
      }

      case STATI.COMPLETE: {
        nomeBersaglio = '—';
        if (cervo.clipCorrente !== 'Deer_Idle') cervo.suona('Deer_Idle', { crossfade: 0.8 });
        if (pianta && pianta.dissolvi(dt)) { pianta.dispose(scena); pianta = null; }
        if (!completato) {
          completato = true;
          if (frutto) { scena.remove(frutto); frutto.geometry.dispose(); frutto = null; }
          onIntroComplete();
        }
        break;
      }
    }

    cervo.aggiorna(dt);
  }

  debug.aggiorna(dt, {
    stato: macchina.stato,
    clip: cervo?.clipCorrente,
    velocitaMouse: puntatore.velocita,
    fermoDa: puntatore.fermoDa,
    agitatoDa: puntatore.agitatoDa,
    distanza,
    target: nomeBersaglio,
    posizione: cervo ? cervo.posizione : new THREE.Vector3(),
    rotazione: cervo ? cervo.angolo : 0
  });
}
passo();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.render(scena, camera);   // se il ciclo e' sospeso, il canvas resterebbe vuoto
});

/** Avanzamento a passi fissi: serve a provare la regia senza dipendere dal refresh. */
function avanza(secondi, dt = 1 / 60) {
  for (let t = 0; t < secondi; t += dt) aggiornaTutto(dt);
  renderer.render(scena, camera);
  return { stato: macchina.stato, clip: cervo?.clipCorrente };
}

if (DEV) window.__intro = { avanza, get forzaRender() { return !!window.__forzaRender; }, set forzaRender(v) { window.__forzaRender = v; }, macchina, get cervo() { return cervo; }, get pianta() { return pianta; }, puntatore, CONFIG, STATI };
