import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { gerens } from "./gerens";
import { Caron } from "./Caron";

// Animación del logo con descriptor en dos tiempos:
//   1) El carón cae al centro, vuela hasta su lugar sobre la Ě y la palabra GĚRENS sube desde una máscara.
//   2) La marca se desplaza a su posición final, aparece la barra y ESCUELA DE POSTGRADO sale desde detrás de ella.
// Todas las capas son el MISMO PNG oficial recortado por zonas (clip-path), así que al terminar se ve
// el logo intacto, sin deformar ni mover ninguna de sus formas.

// Medidas del PNG (logo-descriptor-*.png, 1979 × 257 px).
const SRC_W = 1979;
const SRC_H = 257;
const ZONES = {
  letters: { x0: 0, x1: 1100, y0: 50, y1: SRC_H },
  caron: { x0: 230, x1: 345, y0: 0, y1: 50 },
  bar: { x0: 1100, x1: 1165, y0: 0, y1: SRC_H },
  descriptor: { x0: 1165, x1: SRC_W, y0: 0, y1: SRC_H },
};
// El carón dentro del logo y el centro de la palabra GĚRENS sola.
const CARON = { x: 244, y: 0, w: 87 };
const WORDMARK_CENTER_X = 533;
const BAR_CENTER_Y = (38 + 256) / 2;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const insetFor = (z: { x0: number; x1: number; y0: number; y1: number }) =>
  `inset(${(z.y0 / SRC_H) * 100}% ${((SRC_W - z.x1) / SRC_W) * 100}% ${((SRC_H - z.y1) / SRC_H) * 100}% ${(z.x0 / SRC_W) * 100}%)`;

// Momentos clave relativos a `start` (en frames). Útiles para sincronizar la música.
export const REVEAL_TIMING = {
  caronLands: 15, // el carón cae y se detiene al centro
  caronOnE: 45, // el carón llega a su lugar sobre la Ě
  descriptor: 60, // empieza el segundo tiempo: ESCUELA DE POSTGRADO
  done: 86,
};

type Props = {
  variant: "positivo" | "negativo";
  width: number;
  start?: number;
  // Ancho del carón cuando cae al centro, antes de ir a la Ě.
  heroCaronWidth?: number;
};

export const BrandReveal: React.FC<Props> = ({ variant, width, start = 0, heroCaronWidth = 300 }) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  const s = width / SRC_W;
  const height = SRC_H * s;
  const src = staticFile(variant === "positivo" ? gerens.logos.descriptorPositivo : gerens.logos.descriptorNegativo);
  const caronColor = variant === "positivo" ? gerens.colors.celeste : gerens.colors.blanco;
  const T = REVEAL_TIMING;

  // Tiempo 2: toda la marca se corre desde "GĚRENS centrado" hasta su posición final.
  const aloneShift = (SRC_W / 2 - WORDMARK_CENTER_X) * s;
  const settle = spring({ frame: frame - T.descriptor, fps, config: { damping: 200 }, durationInFrames: 24 });
  const shift = aloneShift * (1 - settle);

  // Tiempo 1: el carón cae al centro, espera un instante y vuela a la Ě.
  const drop = interpolate(frame, [0, T.caronLands], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const fly = interpolate(frame, [T.caronLands + 15, T.caronOnE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const swap = interpolate(frame, [T.caronOnE, T.caronOnE + 4], [0, 1], clamp);
  const caronW = CARON.w * s;
  const caronCx = (CARON.x + CARON.w / 2) * s;
  const caronCy = (CARON.y + 23) * s;
  const heroDx = width / 2 - aloneShift - caronCx;
  const heroDy = height / 2 - caronCy;
  const heroScale = heroCaronWidth / caronW;
  const fallFrom = -900;
  const tx = heroDx * (1 - fly);
  const ty = (heroDy + fallFrom * (1 - drop)) * (1 - fly);
  const sc = 1 + (heroScale - 1) * (1 - fly);

  const lettersUp = interpolate(frame, [T.caronLands + 15, T.caronOnE + 3], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const bar = interpolate(frame, [T.descriptor, T.descriptor + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const desc = interpolate(frame, [T.descriptor + 4, T.descriptor + 24], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const descWidth = (SRC_W - ZONES.descriptor.x0) * s;

  const layer: React.CSSProperties = { position: "absolute", inset: 0 };
  const img: React.CSSProperties = { position: "absolute", left: 0, top: 0, width, height };

  return (
    <div style={{ position: "relative", width, height, transform: `translateX(${shift}px)` }}>
      {/* GĚRENS: las letras suben desde su línea base. */}
      <div style={{ ...layer, clipPath: insetFor(ZONES.letters) }}>
        <Img src={src} style={{ ...img, transform: `translateY(${(1 - lettersUp) * height}px)` }} />
      </div>

      {/* Carón del PNG oficial: aparece cuando el carón animado llega a su sitio. */}
      <div style={{ ...layer, clipPath: insetFor(ZONES.caron), opacity: swap }}>
        <Img src={src} style={img} />
      </div>

      {/* Barra: crece desde su centro. */}
      <div style={{ ...layer, clipPath: insetFor(ZONES.bar) }}>
        <Img
          src={src}
          style={{ ...img, transform: `scaleY(${bar})`, transformOrigin: `0 ${BAR_CENTER_Y * s}px` }}
        />
      </div>

      {/* ESCUELA DE POSTGRADO: sale desde detrás de la barra. */}
      <div style={{ ...layer, clipPath: insetFor(ZONES.descriptor) }}>
        <Img src={src} style={{ ...img, transform: `translateX(${-(1 - desc) * descWidth}px)` }} />
      </div>

      {/* Carón animado (recurso gráfico): cae, se detiene y vuela a la Ě. */}
      {frame >= 0 && swap < 1 ? (
        <div
          style={{
            position: "absolute",
            left: CARON.x * s,
            top: CARON.y * s,
            width: caronW,
            transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
            transformOrigin: "50% 50%",
            opacity: 1 - swap,
          }}
        >
          <Caron width={caronW} color={caronColor} direction="abajo" />
        </div>
      ) : null}
    </div>
  );
};
