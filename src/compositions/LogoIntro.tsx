import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { MaskedLine } from "../components/MaskedLine";
import { theme } from "../theme";

// 5 segundos a 30 fps.
export const LOGO_INTRO_DURATION = 150;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Anillo que se expande desde el centro y se desvanece (el "golpe" inicial).
const Ring: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 45], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  if (frame < delay || p >= 1) return null;
  const size = 80 + p * 1500;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${8 * (1 - p) + 1}px solid ${color}`,
        opacity: 1 - p,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

// El nombre de la marca entra letra por letra con un pequeño rebote.
const Letters: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex" }}>
      {Array.from(text).map((char, i) => {
        const p = spring({
          frame: frame - start - i * 4,
          fps,
          config: { damping: 11, stiffness: 140, mass: 0.6 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              transform: `translateY(${(1 - p) * 140}px) scale(${0.5 + 0.5 * p})`,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

const LogoMark: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (theme.brand.logoFile) {
    const p = spring({ frame: frame - start, fps, config: { damping: 12, mass: 0.7 } });
    return (
      <Img
        src={staticFile(theme.brand.logoFile)}
        style={{ height: 280, opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})` }}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: theme.fonts.heading,
        fontWeight: 800,
        fontSize: 220,
        letterSpacing: "0.04em",
        lineHeight: 1,
        color: theme.colors.text,
      }}
    >
      <Letters text={theme.brand.name} start={start} />
    </div>
  );
};

export const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Línea de acento que se dibuja debajo del nombre.
  const line = spring({ frame: frame - 38, fps, config: { damping: 200 } });

  // Salida: el contenido crece un poco, se desenfoca y desaparece.
  const out = interpolate(frame, [durationInFrames - 25, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <Background />
      <Ring delay={4} color={theme.colors.accent} />
      <Ring delay={12} color={theme.colors.primary} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          opacity: 1 - out,
          transform: `scale(${1 + out * 0.08})`,
          filter: `blur(${out * 14}px)`,
        }}
      >
        <LogoMark start={8} />

        <div
          style={{
            width: 520,
            height: 8,
            marginTop: 28,
            borderRadius: 4,
            background: theme.colors.accent,
            transform: `scaleX(${line})`,
          }}
        />

        <MaskedLine
          delay={50}
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: theme.colors.textMuted,
          }}
        >
          {theme.brand.tagline}
        </MaskedLine>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
