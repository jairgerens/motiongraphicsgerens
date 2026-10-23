// Todo lo que depende de la identidad visual de GĚRENS vive en este archivo.
// Los valores de abajo son provisionales: reemplázalos por los oficiales
// (colores, tipografía, nombre y logo) y todos los videos se actualizan solos.

export const FPS = 30;

export const theme = {
  colors: {
    background: "#0B1220",
    backgroundAlt: "#14213D",
    primary: "#2F6BFF",
    accent: "#FFB703",
    text: "#FFFFFF",
    textMuted: "#A9B4CC",
  },
  // Para cambiar de tipografía, instala otra de @fontsource y cárgala en src/fonts.ts.
  fonts: {
    heading: "Sora, 'Helvetica Neue', Arial, sans-serif",
    body: "Inter, 'Helvetica Neue', Arial, sans-serif",
  },
  brand: {
    name: "GĚRENS",
    tagline: "Escuela de Postgrado",
    // Para usar tu logo: copia el archivo a la carpeta /public (por ejemplo
    // public/logo.png) y escribe aquí "logo.png". Si queda en null, se anima
    // el nombre como texto, letra por letra.
    logoFile: null as string | null,
  },
};
