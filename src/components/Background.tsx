import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

type BlobProps = {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  phase: number;
};

const Blob: React.FC<BlobProps> = ({ x, y, size, color, speed, phase }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame * speed + phase) * 40;
  const dy = Math.cos(frame * speed * 0.8 + phase) * 40;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(100px)",
        opacity: 0.35,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
      }}
    />
  );
};

// Fondo animado: degradado que respira suavemente y dos manchas de color flotando.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = 135 + Math.sin(frame / 60) * 15;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${theme.colors.background}, ${theme.colors.backgroundAlt})`,
        overflow: "hidden",
      }}
    >
      <Blob x={20} y={25} size={700} color={theme.colors.primary} speed={0.02} phase={0} />
      <Blob x={80} y={75} size={600} color={theme.colors.accent} speed={0.025} phase={2} />
    </AbsoluteFill>
  );
};
