import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MaskedLine } from "../components/MaskedLine";
import { theme } from "../theme";

// 6 segundos a 30 fps.
export const LOWER_THIRD_DURATION = 180;

export type LowerThirdProps = {
  name: string;
  role: string;
};

// Cintillo con nombre y cargo para poner encima de una entrevista o un video.
// No tiene fondo: se exporta con transparencia para usarlo en Premiere, CapCut, etc.
export const LowerThird: React.FC<LowerThirdProps> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const smooth = { damping: 200 };

  const bar = spring({ frame, fps, config: smooth, durationInFrames: 18 });
  const panel = spring({ frame: frame - 6, fps, config: smooth, durationInFrames: 22 });
  const exit = spring({
    frame: frame - (durationInFrames - 22),
    fps,
    config: smooth,
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 130,
          display: "flex",
          alignItems: "stretch",
          opacity: 1 - exit,
          transform: `translateX(${-exit * 80}px)`,
        }}
      >
        <div
          style={{
            width: 12,
            background: theme.colors.accent,
            transform: `scaleY(${bar})`,
            transformOrigin: "bottom",
          }}
        />
        <div
          style={{
            background: `${theme.colors.background}E6`,
            padding: "22px 48px 26px 32px",
            clipPath: `inset(0 ${(1 - panel) * 100}% 0 0)`,
          }}
        >
          <MaskedLine
            delay={12}
            style={{
              fontFamily: theme.fonts.heading,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1.1,
              color: theme.colors.text,
            }}
          >
            {name}
          </MaskedLine>
          <MaskedLine
            delay={19}
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "0.06em",
              color: theme.colors.textMuted,
            }}
          >
            {role}
          </MaskedLine>
        </div>
      </div>
    </AbsoluteFill>
  );
};
