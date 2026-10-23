# Motion Graphics GĚRENS

Videos de motion graphics hechos con código, usando [Remotion](https://www.remotion.dev/) (React + TypeScript).
Cada video es un componente: lo editas, lo previsualizas en vivo en el navegador y lo exportas a MP4.

## Piezas institucionales GĚRENS

| ID | Formato | Duración | Qué es |
| --- | --- | --- | --- |
| `Comunika2026` | 1920×1080 (y 4K con `--scale=2`), 30 fps, H.264 + AAC | 30 s exactos | Micro video de auspicio de los Premios Comunika 2026 para proyectar en la ceremonia |

```bash
npm run render:comunika      # out/gerens-comunika-2026-1080p.mp4
npm run render:comunika:4k   # out/gerens-comunika-2026-4k.mp4 (3840×2160)
```

Estructura (los tiempos viven en `src/compositions/comunika/timeline.ts`):
claqueta de inicio (logo en dos tiempos) → "Comunicar bien genera confianza" → auspicio → valores →
"líderes con coraje" → claqueta final (logo en dos tiempos + mensajes de cierre).

**Música:** pista original generada por código (`scripts/music/generate_comunika_music.py`), sin samples de
terceros, así que es libre de derechos. Está sincronizada con la animación del logo y las transiciones.
Si cambias los tiempos del video, vuelve a generarla:

```bash
npm run music:comunika   # requiere Python con numpy y scipy
ffmpeg -i out/comunika-musica-raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 public/audio/comunika-2026-musica.wav
```

Para usar otra canción (por ejemplo de Pixabay Music), reemplaza `public/audio/comunika-2026-musica.wav`
por tu archivo con el mismo nombre, o cambia la ruta del `<Audio>` en `Comunika2026.tsx`.

Estas piezas siguen el Manual de Marca v1.1 (2026) y toman todo de **`src/brand/`**:

- `gerens.ts`: paleta oficial (celeste #20b1e7 como color principal), tipografías Asap y Libre Baskerville, y rutas de los logos.
- `Caron.tsx`: el carón como recurso gráfico, con la forma medida del logo oficial y limitado a las 4 direcciones que permite el manual.
- `BrandReveal.tsx`: animación del logo en dos tiempos (primero GĚRENS con el carón cayendo sobre la Ě, luego la barra y
  ESCUELA DE POSTGRADO). Cada parte es el mismo PNG oficial recortado por zonas, así que al final el logo queda intacto.
- Logos en `public/gerens/`: la versión con el descriptor ESCUELA DE POSTGRADO a la derecha (manual, pág. 11), sacada de `GERENS.png`
  recortando solo el espacio transparente sobrante. La versión en blanco (`logo-descriptor-negativo.png`) es el mismo archivo con
  las formas en blanco, equivalente a la versión "negativo + descriptor" del manual (pág. 7). Si tienes el PNG oficial de esa
  versión, reemplaza el archivo con el mismo nombre.

## Plantillas incluidas

| ID | Formato | Duración | Para qué sirve |
| --- | --- | --- | --- |
| `LogoIntro` | 1920×1080 (16:9) | 5 s | Intro de marca: anillos, nombre letra por letra, línea de acento y tagline |
| `LowerThird` | 1920×1080, fondo transparente | 6 s | Cintillo de nombre y cargo para entrevistas o testimonios |
| `VerticalReel` | 1080×1920 (9:16) | ~11 s | Reel o historia: frase gancho, lista numerada y llamado a la acción |

## Cómo empezar

Necesitas [Node.js](https://nodejs.org/) 18 o superior.

```bash
npm install     # instala todo (solo la primera vez)
npm run dev     # abre Remotion Studio en el navegador
```

En **Remotion Studio** ves cada video, lo reproduces cuadro por cuadro y puedes editar los textos
(panel de la derecha, "Props") sin tocar código.

## Exportar los videos

```bash
npm run render:intro          # out/logo-intro.mp4
npm run render:reel           # out/reel-vertical.mp4
npm run render:lower-third    # out/lower-third.mov (ProRes 4444 con transparencia)
npm run render:all            # los tres
```

El lower third sale en `.mov` ProRes 4444 porque conserva la transparencia y lo leen Premiere,
Final Cut y DaVinci. Si necesitas un archivo más liviano, usa `npm run render:lower-third:webm`.

Para exportar con otros textos sin tocar el código:

```bash
npx remotion render LowerThird out/ana.mov --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png \
  --props='{"name":"Ana Torres","role":"Directora Académica"}'
```

## Cambiar la identidad visual

Todo lo de marca está en **`src/theme.ts`**: colores, tipografías, nombre, tagline y logo.
Cambias ahí y se actualizan todos los videos.

- **Logo:** copia tu archivo a `public/` (por ejemplo `public/logo.png`) y en `theme.ts`
  cambia `logoFile: null` por `logoFile: "logo.png"`. La intro anima tu logo en vez del texto.
- **Tipografías:** se cargan en `src/fonts.ts` desde paquetes de [Fontsource](https://fontsource.org/),
  así que funcionan sin internet.

## Estructura

```
src/
├── index.ts              # punto de entrada
├── Root.tsx              # registro de todos los videos (composiciones)
├── brand/                # identidad oficial GĚRENS (paleta, carón)
├── theme.ts              # colores y fuentes de las plantillas genéricas
├── fonts.ts              # carga de tipografías
├── components/
│   ├── Background.tsx    # fondo animado con degradado
│   └── MaskedLine.tsx    # texto que sube desde una máscara
└── compositions/
    ├── comunika/Comunika2026.tsx
    ├── LogoIntro.tsx
    ├── LowerThird.tsx
    └── VerticalReel.tsx
public/                   # imágenes, logos, audio y video que usen los videos
out/                      # aquí salen los renders (no se sube a git)
```

## Crear un video nuevo

1. Crea un archivo en `src/compositions/`, por ejemplo `MiVideo.tsx`, que exporte un componente React.
2. Regístralo en `src/Root.tsx` con un `<Composition id="MiVideo" ... />`.
3. Anímalo con `useCurrentFrame()`, `spring()` e `interpolate()` (puedes guiarte de las plantillas).

Documentación de Remotion: https://www.remotion.dev/docs

## Licencia de Remotion

Remotion es gratis para personas, organizaciones sin fines de lucro y empresas con fines de lucro
de hasta 3 empleados. Las empresas más grandes necesitan una licencia de empresa:
https://www.remotion.dev/license (precios en https://remotion.pro/license).
