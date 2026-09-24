import * as THREE from 'three';
import { CONFIG } from './config.js';

const facile = (t) => 1 - Math.pow(1 - t, 3);          // easeOutCubic
const dolce = (t) => t * t * (3 - 2 * t);              // smoothstep
const fetta = (t, da, a) => THREE.MathUtils.clamp((t - da) / (a - da), 0, 1);

/** Profilo di una foglia di fico: lobo centrale e due laterali per lato. */
function sagomaFoglia() {
  // mezza foglia da picciolo a punta: tre lobi, profilo morbido via spline
  const meta = [
    [0.05, 0.08], [0.15, 0.15], [0.30, 0.19], [0.43, 0.31],
    [0.31, 0.39], [0.36, 0.49], [0.45, 0.62], [0.29, 0.68],
    [0.25, 0.79], [0.14, 0.90], [0.04, 0.97]
  ];
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.splineThru(meta.map(([x, y]) => new THREE.Vector2(x, y)));
  s.lineTo(0, 1);
  s.splineThru(meta.slice().reverse().map(([x, y]) => new THREE.Vector2(-x, y)));
  s.lineTo(0, 0);
  return s;
}

/** Tubo affusolato lungo una curva: spesso alla base, sottile in punta. */
function ramo(punti, raggioBase, raggioPunta, segmenti = 20) {
  const curva = new THREE.CatmullRomCurve3(punti);
  const g = new THREE.TubeGeometry(curva, segmenti, 1, 8, false);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  const centro = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    curva.getPointAt(THREE.MathUtils.clamp(u, 0, 1), centro);
    v.fromBufferAttribute(pos, i).sub(centro);
    const r = THREE.MathUtils.lerp(raggioBase, raggioPunta, facile(u));
    v.setLength(r).add(centro);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Pianta di fico costruita a codice: radici a zampa, tronco liscio, tre rami,
 * quattro foglie e un frutto solo. Cresce per parti, ognuna con la sua finestra
 * temporale, cosi' la sequenza e' germoglio -> tronco -> rami -> foglie -> frutto.
 */
export class Pianta {
  constructor(scena, posizione) {
    this.gruppo = new THREE.Group();
    this.gruppo.position.copy(posizione);
    scena.add(this.gruppo);

    const H = CONFIG.plantHeight;
    this.materiali = [];

    const legno = new THREE.MeshStandardMaterial({
      color: CONFIG.barkColor, roughness: 0.82, metalness: 0, transparent: true
    });
    const fogliaMat = new THREE.MeshStandardMaterial({
      color: CONFIG.leafColor, roughness: 0.62, metalness: 0,
      side: THREE.DoubleSide, transparent: true
    });
    this.fruttoMat = new THREE.MeshStandardMaterial({
      color: CONFIG.fruitYoung, roughness: 0.55, metalness: 0, transparent: true
    });
    this.materiali.push(legno, fogliaMat, this.fruttoMat);

    this.parti = [];   // { oggetto, da, a, scala }

    /* -- radici: quattro zampe che escono dal terreno ---------------------- */
    const radici = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const l = H * (0.16 + Math.random() * 0.06);
      const g = ramo([
        new THREE.Vector3(0, H * 0.09, 0),
        new THREE.Vector3(Math.cos(a) * l * 0.5, H * 0.045, Math.sin(a) * l * 0.5),
        new THREE.Vector3(Math.cos(a) * l, 0.002, Math.sin(a) * l)
      ], H * 0.028, H * 0.004, 10);
      radici.add(new THREE.Mesh(g, legno));
    }
    this.gruppo.add(radici);
    this.parti.push({ oggetto: radici, da: 0.00, a: 0.16 });

    /* -- tronco: leggermente sinuoso, non un cilindro ---------------------- */
    const tronco = new THREE.Mesh(ramo([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(H * 0.035, H * 0.30, H * 0.01),
      new THREE.Vector3(-H * 0.02, H * 0.60, -H * 0.02),
      new THREE.Vector3(H * 0.02, H * 0.86, 0)
    ], H * 0.055, H * 0.016, 28), legno);
    this.gruppo.add(tronco);
    this.parti.push({ oggetto: tronco, da: 0.10, a: 0.48, asseY: true });

    /* -- rami ---------------------------------------------------------------- */
    const innesti = [
      { y: 0.52, a: 1.9, l: 0.26, da: 0.42, fino: 0.62 },
      { y: 0.66, a: 5.0, l: 0.22, da: 0.48, fino: 0.68 },
      { y: 0.80, a: 3.1, l: 0.18, da: 0.54, fino: 0.72 }
    ];
    this.rami = [];
    for (const r of innesti) {
      const base = new THREE.Vector3(0, H * r.y, 0);
      const cima = new THREE.Vector3(Math.cos(r.a) * H * r.l, H * (r.y + r.l * 0.75), Math.sin(r.a) * H * r.l);
      const g = ramo([
        base,
        base.clone().lerp(cima, 0.5).add(new THREE.Vector3(0, H * 0.03, 0)),
        cima
      ], H * 0.018, H * 0.006, 14);
      const m = new THREE.Mesh(g, legno);
      this.gruppo.add(m);
      this.parti.push({ oggetto: m, da: r.da, a: r.fino });
      this.rami.push({ mesh: m, cima });
    }

    /* -- foglie: quattro, sui rami e in cima ------------------------------- */
    const sagoma = sagomaFoglia();
    const gFoglia = new THREE.ShapeGeometry(sagoma, 24);
    const cime = [
      ...this.rami.map((r) => r.cima),
      new THREE.Vector3(H * 0.02, H * 0.88, 0)
    ];
    this.foglie = [];
    cime.forEach((punto, i) => {
      const pivot = new THREE.Group();
      pivot.position.copy(punto);
      const foglia = new THREE.Mesh(gFoglia, fogliaMat);
      const s = H * (0.34 + (i === cime.length - 1 ? 0.12 : 0));
      foglia.scale.setScalar(s);
      foglia.rotation.set(-Math.PI / 2 + 0.55 + i * 0.12, i * 1.7, 0.2 * (i % 2 ? 1 : -1));
      pivot.add(foglia);
      this.gruppo.add(pivot);
      this.parti.push({ oggetto: pivot, da: 0.62 + i * 0.05, a: 0.82 + i * 0.05 });
      this.foglie.push(pivot);
    });

    /* -- frutto: uno solo, appeso al ramo piu' basso ----------------------- */
    const RF = H * 0.055;
    const gFrutto = new THREE.SphereGeometry(RF, 20, 16);
    const pos = gFrutto.attributes.position;
    for (let i = 0; i < pos.count; i++) {  // a goccia: stretto in alto, tondo sotto
      const y = pos.getY(i);
      const k = 1 - 0.45 * Math.max(0, y / RF);
      pos.setXYZ(i, pos.getX(i) * k, y * 1.12 - RF * 0.18, pos.getZ(i) * k);
    }
    gFrutto.computeVertexNormals();

    this.fruttoPivot = new THREE.Group();
    this.fruttoPivot.position.copy(this.rami[0].cima).add(new THREE.Vector3(0, -H * 0.06, 0));
    this.frutto = new THREE.Mesh(gFrutto, this.fruttoMat);
    this.fruttoPivot.add(this.frutto);
    this.gruppo.add(this.fruttoPivot);
    this.parti.push({ oggetto: this.fruttoPivot, da: 0.80, a: 1.0 });

    // tutto parte da zero
    for (const p of this.parti) p.oggetto.scale.setScalar(0.0001);
    this.cresci(0);
  }

  /** progresso 0-1 dell'intera crescita. */
  cresci(t) {
    for (const p of this.parti) {
      const k = facile(fetta(t, p.da, p.a));
      const s = Math.max(0.0001, k);
      if (p.asseY) p.oggetto.scale.set(0.35 + 0.65 * s, s, 0.35 + 0.65 * s);
      else p.oggetto.scale.setScalar(s);
    }
  }

  /** progresso 0-1 della maturazione: verde -> bordeaux -> viola. */
  matura(t) {
    const c = this.fruttoMat.color;
    if (t < 0.5) c.setHex(CONFIG.fruitYoung).lerp(new THREE.Color(CONFIG.fruitMid), dolce(t / 0.5));
    else c.setHex(CONFIG.fruitMid).lerp(new THREE.Color(CONFIG.fruitRipe), dolce((t - 0.5) / 0.5));
    const gonfio = 1 + 0.16 * dolce(t);
    this.frutto.scale.setScalar(gonfio);
  }

  /** Stacca il frutto e lo consegna alla scena, conservando la posizione nel mondo. */
  staccaFrutto(scena) {
    const p = new THREE.Vector3();
    this.frutto.getWorldPosition(p);
    this.fruttoPivot.remove(this.frutto);
    scena.add(this.frutto);
    this.frutto.position.copy(p);
    return this.frutto;
  }

  /** Dissolvenza lenta, poi rimozione. */
  dissolvi(dt, durata = CONFIG.plantFadeDuration) {
    this._fade = (this._fade ?? 1) - dt / durata;
    const o = Math.max(0, this._fade);
    for (const m of this.materiali) m.opacity = o;
    return o <= 0;
  }

  dispose(scena) {
    scena.remove(this.gruppo);
    this.gruppo.traverse((o) => { if (o.isMesh) o.geometry?.dispose(); });
    for (const m of this.materiali) m.dispose();
  }
}
