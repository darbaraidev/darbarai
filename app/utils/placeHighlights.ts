export const PLACE_HIGHLIGHTS = [
  { slug: "terrasse",        labelFr: "Terrasse",         labelEn: "Terrace",         icon: "🌿" },
  { slug: "rooftop",         labelFr: "Rooftop",          labelEn: "Rooftop",         icon: "🏙️" },
  { slug: "point-de-vue",    labelFr: "Point de vue",     labelEn: "Viewpoint",       icon: "👁️" },
  { slug: "piscine",         labelFr: "Piscine",          labelEn: "Pool",            icon: "🏊" },
  { slug: "decoration",      labelFr: "Décoration",       labelEn: "Decor",           icon: "✨" },
  { slug: "musique-live",    labelFr: "Musique live",     labelEn: "Live music",      icon: "🎵" },
  { slug: "festif",          labelFr: "Festif",           labelEn: "Festive",         icon: "🎉" },
  { slug: "culture",         labelFr: "Culture",          labelEn: "Culture",         icon: "🎭" },
  { slug: "detente",         labelFr: "Détente",          labelEn: "Relaxation",      icon: "🧘" },
  { slug: "cadre-romantique",labelFr: "Cadre romantique", labelEn: "Romantic setting",icon: "🌹" },
  { slug: "alcool",          labelFr: "Alcool",           labelEn: "Alcohol",         icon: "🍷" },
] as const;

export type HighlightSlug = (typeof PLACE_HIGHLIGHTS)[number]["slug"];

export const getHighlightMeta = (slug: string) =>
  PLACE_HIGHLIGHTS.find((h) => h.slug === slug);
