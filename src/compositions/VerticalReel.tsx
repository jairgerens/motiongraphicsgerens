import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { Background } from "../components/Background";
import { MaskedLine } from "../components/MaskedLine";
import { theme } from "../theme";

export type VerticalReelProps = {
  hook: string;
  pointsTitle: string;
  points: string[];
  cta: string;
  ctaDetail: string;
};

// Duraciones en frames (30 frames = 1 segundo).
const HOOK = 80;
const CTA = 100;
const TRANSITION = 18;
const POINTS_INTRO = 30;
const PER_POINT = 35;
const POINTS_HOLD = 55;

const pointsDuration = (count: number) => POINTS_INTRO + count * PER_POINT + POINTS_HOLD;

// Las transiciones se solapan, por eso se restan del total.
export const getReelDuration = (pointCount: number) =>
  HOOK + pointsDuration(pointCount) + CTA - 2 * TRANSITION;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Escena 1: la frase gancho aparece palabra por palabra.
const HookScene: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 28px",
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 116,
          lineHeight: 1.08,
        }}
      >
        {words.map((word, i) => {
          const p = spring({
            frame: frame - 6 - i * 5,
            fps,
            config: { damping: 12, stiffness: 160, mass: 0.6 },
          });
          const isLast = i === words.length - 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: isLast ? theme.colors.accent : theme.colors.text,
                opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
                transform: `translateY(${(1 - p) * 80}px) scale(${0.7 + 0.3 * p})`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Escena 2: lista numerada; cada punto entra deslizándose desde la derecha.
const PointsScene: React.FC<{ title: string; points: string[] }> = ({ title, points }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
      <MaskedLine
        delay={4}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: theme.colors.accent,
          marginBottom: 56,
        }}
      >
        {title}
      </MaskedLine>

      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        {points.map((point, i) => {
          const p = spring({
            frame: frame - POINTS_INTRO - i * PER_POINT,
            fps,
            config: { damping: 14, mass: 0.7 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
                transform: `translateX(${(1 - p) * 300}px)`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 120,
                  height: 120,
                  borderRadius: 32,
                  background: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: theme.fonts.heading,
                  fontWeight: 800,
                  fontSize: 60,
                  color: theme.colors.text,
                  transform: `rotate(${(1 - p) * -25}deg)`,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.heading,
                  fontWeight: 700,
                  fontSize: 64,
                  lineHeight: 1.12,
                  color: theme.colors.text,
                }}
              >
                {point}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Escena 3: marca + llamado a la acción con un botón que "late".
const CtaScene: React.FC<{ cta: string; detail: string }> = ({ cta, detail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const brand = spring({ frame: frame - 4, fps, config: { damping: 12, mass: 0.7 } });
  const button = spring({ frame: frame - 18, fps, config: { damping: 10, mass: 0.6 } });
  const pulse = frame > 40 ? 1 + Math.sin((frame - 40) / 5) * 0.035 : 1;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 170,
          letterSpacing: "0.04em",
          color: theme.colors.text,
          opacity: Math.min(1, brand * 2),
          transform: `scale(${0.6 + 0.4 * brand})`,
        }}
      >
        {theme.brand.name}
      </div>
      <MaskedLine
        delay={10}
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 38,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: theme.colors.textMuted,
          marginBottom: 110,
        }}
      >
        {theme.brand.tagline}
      </MaskedLine>

      <div
        style={{
          padding: "38px 84px",
          borderRadius: 999,
          background: theme.colors.accent,
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: 64,
          color: theme.colors.background,
          opacity: Math.min(1, button * 2),
          transform: `scale(${button * pulse})`,
        }}
      >
        {cta}
      </div>
      <MaskedLine
        delay={30}
        style={{
          marginTop: 44,
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 42,
          color: theme.colors.text,
        }}
      >
        {detail}
      </MaskedLine>
    </AbsoluteFill>
  );
};

// Barra de progreso arriba, estilo historias de Instagram.
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 60,
        right: 60,
        height: 8,
        borderRadius: 4,
        background: "rgba(255,255,255,0.2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(frame / (durationInFrames - 1)) * 100}%`,
          background: theme.colors.text,
        }}
      />
    </div>
  );
};

export const VerticalReel: React.FC<VerticalReelProps> = ({
  hook,
  pointsTitle,
  points,
  cta,
  ctaDetail,
}) => {
  const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={HOOK}>
          <HookScene text={hook} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={pointsDuration(points.length)}>
          <PointsScene title={pointsTitle} points={points} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={CTA}>
          <CtaScene cta={cta} detail={ctaDetail} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <ProgressBar />
    </AbsoluteFill>
  );
};
