import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { gerens } from "../../brand/gerens";
import { Caron } from "../../brand/Caron";
import { BrandReveal } from "../../brand/BrandReveal";
import { MaskedLine } from "../../components/MaskedLine";
import { TIMELINE, WIPE, COMUNIKA_DURATION } from "./timeline";

// Micro video: GĚRENS auspicia los Premios Comunika 2026.
// 1920×1080, 30 fps, exactamente 30 s (900 frames). Para 4K: render con --scale=2.
// Todo el mensaje va en pantalla, así que se entiende sin audio; la música acompaña.

export { COMUNIKA_DURATION };

const { colors, fonts, logos } = gerens;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Logo de la escena de auspicio (fade simple).
const LOGO_WIDTH = 980;
const LOGO_HEIGHT = LOGO_WIDTH / logos.descriptorRatio;
// Logo protagonista de las claquetas.
const CLAQUETA_LOGO_WIDTH = 1200;
// Espacio libre alrededor del logo (área de protección del manual, con holgura).
const LOGO_CLEARANCE = 84;

/* ---------------------------------------------------------------- recursos */

// Transición: una franja de color y luego la escena nueva bajan con el borde
// en forma de V, como el carón apuntando hacia abajo.
const CaronWipe: React.FC<{ band: string; children: React.ReactNode }> = ({ band, children }) => {
  const frame = useCurrentFrame();
  if (frame >= WIPE) return <AbsoluteFill>{children}</AbsoluteFill>;

  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const bandP = interpolate(frame, [0, WIPE - 4], [0, 1], ease);
  const sceneP = interpolate(frame, [4, WIPE], [0, 1], ease);
  const depth = 28; // profundidad de la V, en % del alto
  const clip = (p: number) => {
    const y = p * (100 + depth);
    return `polygon(0% 0%, 100% 0%, 100% ${y - depth}%, 50% ${y}%, 0% ${y - depth}%)`;
  };

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: band, clipPath: clip(bandP) }} />
      <AbsoluteFill style={{ clipPath: clip(sceneP) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// El logo solo entra con fade (el manual no permite otros efectos sobre él).
const Logo: React.FC<{ file: string; start: number }> = ({ file, start }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 22], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  return <Img src={staticFile(file)} style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT, opacity }} />;
};

// Subrayado amarillo que se dibuja de izquierda a derecha.
const Underline: React.FC<{ start: number; thickness?: number; style?: React.CSSProperties }> = ({
  start,
  thickness = 6,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        height: thickness,
        background: colors.amarillo,
        transform: `scaleX(${p})`,
        transformOrigin: "left",
        ...style,
      }}
    />
  );
};

// Acercamiento lento durante la escena, para que nada quede totalmente quieto.
const useSlowPush = (duration: number, amount = 0.025) => {
  const frame = useCurrentFrame();
  return 1 + interpolate(frame, [0, duration], [0, amount], clamp);
};

/* ----------------------------------------------------------------- escenas */

// Claqueta de inicio: fondo celeste, logo en blanco en dos tiempos.
const ClaquetaInicio: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.celeste, justifyContent: "center", alignItems: "center" }}>
      <BrandReveal variant="negativo" width={CLAQUETA_LOGO_WIDTH} start={0} />
    </AbsoluteFill>
  );
};

// 1. Fondo blanco: el carón baja y se detiene, y aparece la frase.
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 10, fps, config: { damping: 13, mass: 0.9, stiffness: 90 } });
  const push = useSlowPush(TIMELINE.s1.dur);
  const text: React.CSSProperties = {
    fontFamily: fonts.asap,
    fontWeight: 700,
    fontSize: 112,
    lineHeight: 1.08,
    color: colors.grisOscuro,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{ background: colors.blanco, justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${(1 - drop) * -620}px)`, marginBottom: 64 }}>
        <Caron width={150} color={colors.celeste} direction="abajo" />
      </div>
      <div style={{ transform: `scale(${push})` }}>
        <MaskedLine delay={30} style={text}>
          Comunicar bien
        </MaskedLine>
        <MaskedLine delay={38} style={text}>
          genera confianza.
        </MaskedLine>
      </div>
    </AbsoluteFill>
  );
};

// 2. Fondo celeste: logo en blanco con descriptor y el mensaje de auspicio.
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, TIMELINE.s2.dur + WIPE], [0, 60], clamp);

  return (
    <AbsoluteFill style={{ background: colors.celeste }}>
      {/* Carones de fondo, blancos y translúcidos, lejos del área del logo. */}
      <div style={{ position: "absolute", right: -260, top: -170 + drift }}>
        <Caron width={760} color={colors.blanco} opacity={0.12} direction="abajo" />
      </div>
      <div style={{ position: "absolute", left: -300, bottom: -230 - drift }}>
        <Caron width={680} color={colors.blanco} opacity={0.1} direction="arriba" />
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Logo file={logos.descriptorNegativo} start={12} />
        <MaskedLine
          delay={30}
          style={{
            marginTop: LOGO_CLEARANCE,
            fontFamily: fonts.asap,
            fontWeight: 700,
            fontSize: 84,
            color: colors.blanco,
            textAlign: "center",
          }}
        >
          auspicia los Premios Comunika 2026
        </MaskedLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 3. Fondo blanco: los tres valores entran de a uno, con el carón apuntando a la derecha.
const VALUES = ["EXCELENCIA", "CONFIANZA", "INTEGRIDAD"];
export const VALUE_START = 18;
export const VALUE_GAP = 60;

const ValueRow: React.FC<{ word: string; start: number }> = ({ word, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 15, mass: 0.8 } });
  // El carón entra desde la izquierda (en su misma dirección) y luego "respira" unos píxeles.
  const breathe = frame > start + 30 ? Math.sin((frame - start) / 14) * 4 : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
      <div
        style={{
          width: 90,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
          transform: `translateX(${-110 * (1 - p) + breathe}px)`,
        }}
      >
        <Caron width={104} color={colors.celeste} direction="derecha" />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <MaskedLine
          delay={start + 6}
          style={{
            fontFamily: fonts.asap,
            fontWeight: 700,
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: "0.04em",
            color: colors.azul,
          }}
        >
          {word}
        </MaskedLine>
        <Underline start={start + 18} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
};

const Scene3: React.FC = () => {
  const push = useSlowPush(TIMELINE.s3.dur, 0.02);
  return (
    <AbsoluteFill style={{ background: colors.blanco, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 52, transform: `scale(${push})` }}>
        {VALUES.map((word, i) => (
          <ValueRow key={word} word={word} start={VALUE_START + i * VALUE_GAP} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 4. Fondo azul: frase en Libre Baskerville con "coraje" subrayado.
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const push = useSlowPush(TIMELINE.s4.dur, 0.03);
  const drift = interpolate(frame, [0, TIMELINE.s4.dur + WIPE], [0, 50], clamp);
  const text: React.CSSProperties = {
    fontFamily: fonts.baskerville,
    fontWeight: 400,
    fontSize: 88,
    lineHeight: 1.3,
    color: colors.blanco,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{ background: colors.azul }}>
      <div style={{ position: "absolute", left: -240, top: -150 + drift }}>
        <Caron width={720} color={colors.celeste} opacity={0.22} direction="abajo" />
      </div>
      <div style={{ position: "absolute", right: -260, bottom: -190 - drift }}>
        <Caron width={640} color={colors.celeste} opacity={0.18} direction="arriba" />
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${push})` }}>
          <MaskedLine delay={16} style={text}>
            Transformamos profesionales
          </MaskedLine>
          <MaskedLine delay={26} style={text}>
            en líderes con{" "}
            <span style={{ display: "inline-block", position: "relative" }}>
              coraje
              <Underline start={52} style={{ position: "absolute", left: 0, right: 0, bottom: "0.04em" }} />
            </span>
            .
          </MaskedLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Claqueta final: logo protagonista en dos tiempos, luego los mensajes de cierre y fade out.
export const OUTRO_REVEAL_START = 8;
const OUTRO_LINES_START = OUTRO_REVEAL_START + 80;
// Fade out final corto, para que www.gerens.pe se lea más de un segundo.
const OUTRO_FADE = 20;

const ClaquetaFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lift = spring({ frame: frame - (OUTRO_LINES_START - 6), fps, config: { damping: 200 }, durationInFrames: 26 });
  const fadeOut = interpolate(frame, [TIMELINE.outro.dur - 2 - OUTRO_FADE, TIMELINE.outro.dur - 2], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const line = (size: number): React.CSSProperties => ({
    fontFamily: fonts.asap,
    fontWeight: 500,
    fontSize: size,
    color: colors.grisOscuro,
    textAlign: "center",
  });
  const logoHeight = CLAQUETA_LOGO_WIDTH / logos.descriptorRatio;

  return (
    <AbsoluteFill style={{ background: colors.blanco, opacity: fadeOut }}>
      {/* El logo empieza al centro y sube para dar lugar a los mensajes. */}
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", transform: `translateY(${-150 * lift}px)` }}
      >
        <BrandReveal variant="positivo" width={CLAQUETA_LOGO_WIDTH} start={OUTRO_REVEAL_START} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 540 + logoHeight / 2 - 150 + LOGO_CLEARANCE + 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <MaskedLine delay={OUTRO_LINES_START} style={line(62)}>
          Felicitaciones a los premiados
        </MaskedLine>
        <MaskedLine delay={OUTRO_LINES_START + 8} style={{ ...line(46), marginTop: 6 }}>
          Crecemos juntos por un país mejor
        </MaskedLine>
        <MaskedLine delay={OUTRO_LINES_START + 16} style={{ ...line(38), marginTop: 30, letterSpacing: "0.04em" }}>
          www.gerens.pe
        </MaskedLine>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- composición */

export const Comunika2026: React.FC = () => {
  const { intro, s1, s2, s3, s4, outro } = TIMELINE;
  return (
    <AbsoluteFill style={{ background: colors.blanco }}>
      <Sequence from={intro.from} durationInFrames={intro.dur + WIPE} name="0 · Claqueta inicio">
        <ClaquetaInicio />
      </Sequence>
      <Sequence from={s1.from} durationInFrames={s1.dur + WIPE} name="1 · Comunicar bien">
        <CaronWipe band={colors.azul}>
          <Scene1 />
        </CaronWipe>
      </Sequence>
      <Sequence from={s2.from} durationInFrames={s2.dur + WIPE} name="2 · Auspicio">
        <CaronWipe band={colors.azul}>
          <Scene2 />
        </CaronWipe>
      </Sequence>
      <Sequence from={s3.from} durationInFrames={s3.dur + WIPE} name="3 · Valores">
        <CaronWipe band={colors.azul}>
          <Scene3 />
        </CaronWipe>
      </Sequence>
      <Sequence from={s4.from} durationInFrames={s4.dur + WIPE} name="4 · Coraje">
        <CaronWipe band={colors.celeste}>
          <Scene4 />
        </CaronWipe>
      </Sequence>
      <Sequence from={outro.from} durationInFrames={outro.dur} name="5 · Claqueta final">
        <CaronWipe band={colors.celeste}>
          <ClaquetaFinal />
        </CaronWipe>
      </Sequence>

      {/* Música original generada por código (scripts/music/), libre de derechos. */}
      <Audio src={staticFile("audio/comunika-2026-musica.wav")} />
    </AbsoluteFill>
  );
};
