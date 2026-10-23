import React from "react";
import {
  AbsoluteFill,
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
import { Caron, type CaronDirection } from "../../brand/Caron";
import { MaskedLine } from "../../components/MaskedLine";

// Micro video: GĚRENS auspicia los Premios Comunika 2026.
// 1920×1080, 30 fps, exactamente 30 s (900 frames). Para 4K: render con --scale=2.
// Todo el mensaje va en pantalla, así que se entiende sin audio.

export const COMUNIKA_DURATION = 900;

const { colors, fonts, logos } = gerens;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Ancho del logo con descriptor. A 1080p ocupa ~980 px; en 4K (2×) queda casi
// a la resolución nativa del PNG oficial (1979 px), así que no se pixela.
const LOGO_WIDTH = 980;
const LOGO_HEIGHT = LOGO_WIDTH / logos.descriptorRatio;
// Espacio libre alrededor del logo (área de protección del manual, con holgura).
const LOGO_CLEARANCE = 84;

// Cada escena: inicio y duración en frames (30 frames = 1 s).
const S1 = { from: 0, dur: 120 }; // 0:00-0:04
const S2 = { from: 120, dur: 150 }; // 0:04-0:09
const S3 = { from: 270, dur: 270 }; // 0:09-0:18
const S4 = { from: 540, dur: 180 }; // 0:18-0:24
const S5 = { from: 720, dur: 180 }; // 0:24-0:30

// Las transiciones entran al inicio de cada escena; la escena anterior sigue
// viva debajo durante esos frames para que no haya un cuadro vacío.
const WIPE = 16;

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

// 1. Fondo blanco: el carón baja y se detiene, y aparece la frase.
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 4, fps, config: { damping: 13, mass: 0.9, stiffness: 90 } });
  const push = useSlowPush(S1.dur);
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
        <Caron width={170} color={colors.celeste} direction="abajo" />
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
  const drift = interpolate(frame, [0, S2.dur + WIPE], [0, 60], clamp);

  return (
    <AbsoluteFill style={{ background: colors.celeste }}>
      {/* Carón de fondo, blanco translúcido, lejos del área del logo. */}
      <div style={{ position: "absolute", right: -260, top: -170 + drift }}>
        <Caron width={760} color={colors.blanco} opacity={0.12} direction="abajo" />
      </div>
      <div style={{ position: "absolute", left: -300, bottom: -230 - drift }}>
        <Caron width={680} color={colors.blanco} opacity={0.1} direction="arriba" />
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Logo file={logos.descriptorNegativo} start={14} />
        <MaskedLine
          delay={40}
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

// 3. Fondo blanco: los tres valores entran de a uno, cada uno con su carón.
const VALUES: { word: string; direction: CaronDirection }[] = [
  { word: "EXCELENCIA", direction: "arriba" },
  { word: "CONFIANZA", direction: "derecha" },
  { word: "INTEGRIDAD", direction: "abajo" },
];
const VALUE_START = 18;
const VALUE_GAP = 72;

const ENTRY_OFFSET: Record<CaronDirection, [number, number]> = {
  arriba: [0, 90],
  abajo: [0, -90],
  derecha: [-90, 0],
  izquierda: [90, 0],
};

const ValueRow: React.FC<{ word: string; direction: CaronDirection; start: number }> = ({
  word,
  direction,
  start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 15, mass: 0.8 } });
  const [dx, dy] = ENTRY_OFFSET[direction];
  // Después de entrar, el carón "respira" unos píxeles en su propia dirección.
  const breathe = frame > start + 30 ? Math.sin((frame - start) / 14) * 4 : 0;
  const bx = dx === 0 ? 0 : (-Math.sign(dx) * breathe);
  const by = dy === 0 ? 0 : (-Math.sign(dy) * breathe);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
      <div
        style={{
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
          transform: `translate(${dx * (1 - p) + bx}px, ${dy * (1 - p) + by}px)`,
        }}
      >
        <Caron width={104} color={colors.celeste} direction={direction} />
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
  const push = useSlowPush(S3.dur, 0.02);
  return (
    <AbsoluteFill style={{ background: colors.blanco, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 52,
          transform: `scale(${push})`,
        }}
      >
        {VALUES.map((v, i) => (
          <ValueRow key={v.word} word={v.word} direction={v.direction} start={VALUE_START + i * VALUE_GAP} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 4. Fondo azul: frase en Libre Baskerville con "coraje" subrayado.
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const push = useSlowPush(S4.dur, 0.03);
  const drift = interpolate(frame, [0, S4.dur + WIPE], [0, 50], clamp);
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
              <Underline
                start={56}
                style={{ position: "absolute", left: 0, right: 0, bottom: "0.04em" }}
              />
            </span>
            .
          </MaskedLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 5. Fondo blanco: logo con descriptor, mensajes de cierre y fade out final.
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [S5.dur - 30, S5.dur - 2], [1, 0], {
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

  return (
    <AbsoluteFill style={{ background: colors.blanco }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
        <Logo file={logos.descriptorPositivo} start={14} />
        <div style={{ marginTop: LOGO_CLEARANCE + 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <MaskedLine delay={42} style={line(62)}>
            Felicitaciones a los premiados
          </MaskedLine>
          <MaskedLine delay={52} style={{ ...line(46), marginTop: 6 }}>
            Crecemos juntos por un país mejor
          </MaskedLine>
          <MaskedLine delay={64} style={{ ...line(38), marginTop: 30, letterSpacing: "0.04em" }}>
            www.gerens.pe
          </MaskedLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- composición */

export const Comunika2026: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: colors.blanco }}>
      <Sequence from={S1.from} durationInFrames={S1.dur + WIPE} name="1 · Comunicar bien">
        <Scene1 />
      </Sequence>
      <Sequence from={S2.from} durationInFrames={S2.dur + WIPE} name="2 · Auspicio">
        <CaronWipe band={colors.azul}>
          <Scene2 />
        </CaronWipe>
      </Sequence>
      <Sequence from={S3.from} durationInFrames={S3.dur + WIPE} name="3 · Valores">
        <CaronWipe band={colors.azul}>
          <Scene3 />
        </CaronWipe>
      </Sequence>
      <Sequence from={S4.from} durationInFrames={S4.dur + WIPE} name="4 · Coraje">
        <CaronWipe band={colors.celeste}>
          <Scene4 />
        </CaronWipe>
      </Sequence>
      <Sequence from={S5.from} durationInFrames={S5.dur} name="5 · Cierre">
        <CaronWipe band={colors.celeste}>
          <Scene5 />
        </CaronWipe>
      </Sequence>
    </AbsoluteFill>
  );
};
