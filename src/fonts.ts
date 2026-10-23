import { loadFont } from "@remotion/fonts";

// Las fuentes vienen de npm (@fontsource), así que el render funciona sin internet.
// Se cargan dos subconjuntos por peso: "latin" y "latin-ext". El segundo es el que
// trae la Ě de GĚRENS; sin él, esa letra saldría en otra tipografía.
import sora600 from "@fontsource/sora/files/sora-latin-600-normal.woff2";
import sora700 from "@fontsource/sora/files/sora-latin-700-normal.woff2";
import sora800 from "@fontsource/sora/files/sora-latin-800-normal.woff2";
import sora600Ext from "@fontsource/sora/files/sora-latin-ext-600-normal.woff2";
import sora700Ext from "@fontsource/sora/files/sora-latin-ext-700-normal.woff2";
import sora800Ext from "@fontsource/sora/files/sora-latin-ext-800-normal.woff2";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff2";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff2";
import inter400Ext from "@fontsource/inter/files/inter-latin-ext-400-normal.woff2";
import inter500Ext from "@fontsource/inter/files/inter-latin-ext-500-normal.woff2";
import inter600Ext from "@fontsource/inter/files/inter-latin-ext-600-normal.woff2";
// Tipografías oficiales de GĚRENS (Manual de Marca v1.1): Asap y Libre Baskerville.
import asap500 from "@fontsource/asap/files/asap-latin-500-normal.woff2";
import asap600 from "@fontsource/asap/files/asap-latin-600-normal.woff2";
import asap700 from "@fontsource/asap/files/asap-latin-700-normal.woff2";
import asap500Ext from "@fontsource/asap/files/asap-latin-ext-500-normal.woff2";
import asap600Ext from "@fontsource/asap/files/asap-latin-ext-600-normal.woff2";
import asap700Ext from "@fontsource/asap/files/asap-latin-ext-700-normal.woff2";
import baskerville400 from "@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff2";
import baskerville700 from "@fontsource/libre-baskerville/files/libre-baskerville-latin-700-normal.woff2";
import baskerville400Ext from "@fontsource/libre-baskerville/files/libre-baskerville-latin-ext-400-normal.woff2";
import baskerville700Ext from "@fontsource/libre-baskerville/files/libre-baskerville-latin-ext-700-normal.woff2";

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const faces = [
  { family: "Sora", weight: "600", latin: sora600, ext: sora600Ext },
  { family: "Sora", weight: "700", latin: sora700, ext: sora700Ext },
  { family: "Sora", weight: "800", latin: sora800, ext: sora800Ext },
  { family: "Inter", weight: "400", latin: inter400, ext: inter400Ext },
  { family: "Inter", weight: "500", latin: inter500, ext: inter500Ext },
  { family: "Inter", weight: "600", latin: inter600, ext: inter600Ext },
  { family: "Asap", weight: "500", latin: asap500, ext: asap500Ext },
  { family: "Asap", weight: "600", latin: asap600, ext: asap600Ext },
  { family: "Asap", weight: "700", latin: asap700, ext: asap700Ext },
  { family: "Libre Baskerville", weight: "400", latin: baskerville400, ext: baskerville400Ext },
  { family: "Libre Baskerville", weight: "700", latin: baskerville700, ext: baskerville700Ext },
];

for (const face of faces) {
  loadFont({ family: face.family, weight: face.weight, url: face.latin, format: "woff2", unicodeRange: LATIN });
  loadFont({ family: face.family, weight: face.weight, url: face.ext, format: "woff2", unicodeRange: LATIN_EXT });
}
