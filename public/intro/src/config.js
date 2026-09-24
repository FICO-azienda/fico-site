/**
 * Tutti i numeri dell'intro stanno qui. Nessun valore magico sparso nel codice:
 * se una cosa va calibrata, si calibra da questo file.
 */
export const CONFIG = {
  /* -- cervo: inseguimento ------------------------------------------------ */
  followSpeed: 1.35,          // m/s, velocita' massima di camminata
  acceleration: 1.8,          // m/s^2
  deceleration: 2.6,          // m/s^2, la frenata e' piu' decisa della partenza
  rotationSpeed: 2.2,         // rad/s massimi di rotazione del corpo
  stopDistance: 0.55,         // m: sotto questa distanza il cervo considera di essere arrivato
  slowWalkDistance: 1.8,      // m: sotto questa distanza passa alla camminata lenta

  /* -- scelta delle clip di camminata ------------------------------------- */
  turnThreshold: 0.42,        // rad: oltre questo scarto angolare usa le clip L/R
  turnRelease: 0.22,          // rad: isteresi, sotto questa soglia torna a F
  gaitMinHold: 0.45,          // s: tempo minimo su una clip prima di poterla cambiare

  /* -- mouse --------------------------------------------------------------- */
  mouseSpeedThreshold: 1400,  // px/s sulla media mobile: sopra, il movimento e' "agitato"
  mouseFastDuration: 1.2,     // s di agitazione continua prima che il cervo si stufi
  mouseSpeedSmoothing: 0.12,  // costante della media mobile esponenziale (0-1, piu' alto = piu' reattivo)
  sittingCooldown: 3.0,       // s da seduto prima di poter tornare a seguire
  stillnessThreshold: 90,     // px/s sotto cui il puntatore e' considerato fermo
  stillnessDuration: 0.8,     // s di immobilita' che fanno nascere il fico
  autoFigTimeout: 6,          // s: oltre questi, la pianta nasce da sola e il rito parte

  /* -- pianta e frutto ----------------------------------------------------- */
  figGrowthDuration: 5.2,     // s: germoglio -> tronco -> rami -> foglie -> frutto
  figRipeningDuration: 3.4,   // s: verde -> bordeaux -> viola
  plantHeight: 0.95,          // m: altezza della pianta adulta
  fruitFallGravity: 5.4,      // m/s^2 (rallentata rispetto al vero: piu' elegante)
  fruitBounce: 0.22,          // coefficiente di restituzione del rimbalzo
  fruitDamping: 0.86,         // smorzamento orizzontale a ogni rimbalzo
  fruitRestSpeed: 0.12,       // m/s sotto cui il frutto e' considerato fermo

  /* -- pasto --------------------------------------------------------------- */
  eatDisappearProgress: 0.42, // punto della clip di pascolo in cui il muso tocca terra
  eatStandoff: 1.02,          // m: il muso sta un metro avanti al pivot, il corpo si ferma prima
  plantFadeDuration: 2.6,     // s di dissolvenza della pianta a pasto finito

  /* -- animazioni ----------------------------------------------------------- */
  animationCrossfade: 0.42,   // s di incrocio fra due clip

  /* -- scena ---------------------------------------------------------------- */
  modelScale: 0.01,           // il modello e' in centimetri
  ivory: 0xF1EEE5,
  deerColor: 0xE9E3D6,
  barkColor: 0xE3DCCB,
  leafColor: 0x2F4A2B,        // verde fico profondo
  fruitYoung: 0x6E8C3A,       // verde acerbo
  fruitMid: 0x7B2233,         // bordeaux
  fruitRipe: 0x41203F,        // viola fico
  maxPixelRatio: 2,
  cameraFov: 30
};

/** Il pannello di debug esiste solo in sviluppo. */
export const DEV =
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.search.includes('debug');
