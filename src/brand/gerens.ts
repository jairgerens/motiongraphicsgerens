// Identidad oficial de GĚRENS según el Manual de Marca v1.1 (2026).
// Úsalo en las piezas institucionales; theme.ts queda para las plantillas genéricas.

export const gerens = {
  colors: {
    // Color primario: debe predominar.
    celeste: "#20b1e7",
    // Secundarios: de apoyo, sin competir con el celeste.
    azul: "#0777be",
    celesteGris: "#c9d8e0",
    grisOscuro: "#58595b",
    grisMedio: "#a3a5a8",
    // Solo como acento pequeño (subrayados, detalles).
    amarillo: "#fdb91d",
    blanco: "#ffffff",
  },
  fonts: {
    // Principal: titulares, mensajes destacados y textos.
    asap: "Asap, 'Helvetica Neue', Arial, sans-serif",
    // Secundaria: solo en mensajes destacados y en menor proporción.
    baskerville: "'Libre Baskerville', Georgia, serif",
  },
  logos: {
    // Logo + descriptor ESCUELA DE POSTGRADO a la derecha (versión indicada por el manual, pág. 11).
    // Ambos salen de "GERENS.png" recortando solo el espacio transparente sobrante.
    descriptorPositivo: "gerens/logo-descriptor-positivo.png",
    // Versión en blanco del mismo archivo (manual pág. 7: "negativo + descriptor").
    // Solo sobre celeste #20b1e7 o sobre imagen oscura.
    descriptorNegativo: "gerens/logo-descriptor-negativo.png",
    // Proporción ancho / alto del logo con descriptor.
    descriptorRatio: 1979 / 257,
  },
} as const;
