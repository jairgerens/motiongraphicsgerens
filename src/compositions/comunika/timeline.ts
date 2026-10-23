// Línea de tiempo del video Comunika 2026 (30 fps). La música en scripts/music/
// usa estos mismos tiempos: si cambias algo aquí, vuelve a generar el audio.

export const COMUNIKA_DURATION = 900; // 30 s exactos

export const TIMELINE = {
  intro: { from: 0, dur: 120 }, // 0:00-0:04  Claqueta de inicio
  s1: { from: 120, dur: 120 }, // 0:04-0:08  Comunicar bien genera confianza
  s2: { from: 240, dur: 120 }, // 0:08-0:12  Auspicio
  s3: { from: 360, dur: 210 }, // 0:12-0:19  Valores
  s4: { from: 570, dur: 150 }, // 0:19-0:24  Coraje
  outro: { from: 720, dur: 180 }, // 0:24-0:30  Claqueta final
};

// Duración de la transición en V al inicio de cada escena.
export const WIPE = 16;
