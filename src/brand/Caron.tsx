import React from "react";

// El carón (la "V" sobre la Ě del logo) como recurso gráfico.
// La forma está medida del logo oficial (coincide en un 98,9 % con el original).
// El manual solo permite 4 direcciones: no girarlo en otros ángulos.

export type CaronDirection = "abajo" | "arriba" | "izquierda" | "derecha";

const ROTATION: Record<CaronDirection, number> = {
  abajo: 0,
  izquierda: 90,
  arriba: 180,
  derecha: -90,
};

// viewBox 0 0 100 52.56; en su forma original la V apunta hacia abajo.
export const CARON_RATIO = 52.56 / 100;
const POINTS = "0,0 12.45,0 50,30.75 87.55,0 100,0 63.78,52.56 36.22,52.56";

type Props = {
  // Ancho del carón en píxeles (medido con la V apuntando hacia abajo).
  width: number;
  color: string;
  direction?: CaronDirection;
  opacity?: number;
  style?: React.CSSProperties;
};

export const Caron: React.FC<Props> = ({ width, color, direction = "abajo", opacity = 1, style }) => {
  const height = width * CARON_RATIO;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 52.56"
      style={{
        display: "block",
        overflow: "visible",
        opacity,
        transform: `rotate(${ROTATION[direction]}deg)`,
        ...style,
      }}
    >
      <polygon points={POINTS} fill={color} />
    </svg>
  );
};
