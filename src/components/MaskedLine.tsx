import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  children: React.ReactNode;
  // Frames de espera antes de que el texto empiece a subir.
  delay?: number;
  style?: React.CSSProperties;
};

// Texto que "sube" desde una máscara invisible. Es el efecto clásico de
// títulos en motion graphics: la línea aparece como si saliera de debajo de una regla.
export const MaskedLine: React.FC<Props> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div style={{ overflow: "hidden", padding: "0.12em 0", ...style }}>
      <div style={{ transform: `translateY(${(1 - progress) * 110}%)` }}>{children}</div>
    </div>
  );
};
