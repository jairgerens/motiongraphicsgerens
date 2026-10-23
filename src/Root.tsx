import React from "react";
import { Composition, Folder } from "remotion";
import { FPS } from "./theme";
import { LogoIntro, LOGO_INTRO_DURATION } from "./compositions/LogoIntro";
import { LowerThird, LOWER_THIRD_DURATION, type LowerThirdProps } from "./compositions/LowerThird";
import { VerticalReel, getReelDuration, type VerticalReelProps } from "./compositions/VerticalReel";

// Aquí se registran todos los videos. Cada <Composition> aparece en Remotion Studio
// y se puede renderizar por su id (por ejemplo: npx remotion render LogoIntro).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Horizontal-16x9">
        <Composition
          id="LogoIntro"
          component={LogoIntro}
          durationInFrames={LOGO_INTRO_DURATION}
          fps={FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="LowerThird"
          component={LowerThird}
          durationInFrames={LOWER_THIRD_DURATION}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={
            {
              name: "Nombre Apellido",
              role: "Cargo o especialidad",
            } satisfies LowerThirdProps
          }
        />
      </Folder>

      <Folder name="Vertical-9x16">
        <Composition
          id="VerticalReel"
          component={VerticalReel}
          durationInFrames={getReelDuration(3)}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={
            {
              hook: "¿Tu carrera necesita un nuevo impulso?",
              pointsTitle: "Lo que vas a ganar",
              points: [
                "Herramientas para liderar equipos",
                "Casos reales de empresas",
                "Una red de contactos que suma",
              ],
              cta: "Inscríbete hoy",
              ctaDetail: "Escríbenos por WhatsApp",
            } satisfies VerticalReelProps
          }
          // La duración se ajusta sola según cuántos puntos tenga la lista.
          calculateMetadata={({ props }) => ({
            durationInFrames: getReelDuration(props.points.length),
          })}
        />
      </Folder>
    </>
  );
};
