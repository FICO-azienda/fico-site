import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * Caduta del fico: velocita', gravita', smorzamento. Nessuna libreria di fisica
 * per un solo corpo che cade da mezzo metro e rimbalza una volta.
 */
export class FruttoInCaduta {
  constructor(mesh, quotaTerreno = 0) {
    this.mesh = mesh;
    this.terreno = quotaTerreno;
    this.velocita = new THREE.Vector3(0, 0, 0);
    this.rotazione = new THREE.Vector3(
      (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.6
    );
    this.raggio = (mesh.geometry.boundingSphere?.radius ?? 0.08) * mesh.scale.x;
    if (!mesh.geometry.boundingSphere) {
      mesh.geometry.computeBoundingSphere();
      this.raggio = mesh.geometry.boundingSphere.radius * mesh.scale.x;
    }
    this.fermo = false;
  }

  /** true quando si e' fermato a terra. */
  aggiorna(dt) {
    if (this.fermo) return true;

    this.velocita.y -= CONFIG.fruitFallGravity * dt;
    this.mesh.position.addScaledVector(this.velocita, dt);
    this.mesh.rotation.x += this.rotazione.x * dt;
    this.mesh.rotation.z += this.rotazione.z * dt;

    const appoggio = this.terreno + this.raggio * 0.82;
    if (this.mesh.position.y <= appoggio) {
      this.mesh.position.y = appoggio;
      if (Math.abs(this.velocita.y) < CONFIG.fruitRestSpeed) {
        this.velocita.set(0, 0, 0);
        this.rotazione.set(0, 0, 0);
        this.fermo = true;
      } else {
        this.velocita.y = -this.velocita.y * CONFIG.fruitBounce;
        this.velocita.x *= CONFIG.fruitDamping;
        this.velocita.z *= CONFIG.fruitDamping;
        this.rotazione.multiplyScalar(0.45);
      }
    }
    return this.fermo;
  }
}
