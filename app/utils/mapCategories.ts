export const MAP_CATEGORY_GROUPS = [
  {
    slug: "restaurer",
    labelFr: "Se restaurer",
    labelEn: "Eat",
    icon: "🍽️",
    color: "#dc2626",
    categories: [
      { slug: "restaurant",  labelFr: "Restaurant",  labelEn: "Restaurant", icon: "🍽️" },
      { slug: "fast-food",   labelFr: "Fast Food",   labelEn: "Fast Food",  icon: "🌮" },
      { slug: "pizzeria",    labelFr: "Pizzeria",    labelEn: "Pizzeria",   icon: "🍕" },
    ],
  },
  {
    slug: "boire",
    labelFr: "Boire un verre",
    labelEn: "Drinks",
    icon: "🍸",
    color: "#7c3aed",
    categories: [
      { slug: "bar",          labelFr: "Bar",          labelEn: "Bar",          icon: "🍸" },
      { slug: "bar-dansant",  labelFr: "Bar dansant",  labelEn: "Dancing bar",  icon: "💃" },
      { slug: "club",         labelFr: "Club",         labelEn: "Club",         icon: "🎧" },
    ],
  },
  {
    slug: "pause",
    labelFr: "Pause gourmande",
    labelEn: "Café & sweets",
    icon: "☕",
    color: "#92400e",
    categories: [
      { slug: "cafe",         labelFr: "Café",         labelEn: "Café",         icon: "☕" },
      { slug: "boulangerie",  labelFr: "Boulangerie",  labelEn: "Bakery",       icon: "🥐" },
      { slug: "patisserie",   labelFr: "Pâtisserie",   labelEn: "Pastry shop",  icon: "🍰" },
      { slug: "glacier",      labelFr: "Glacier",      labelEn: "Ice cream",    icon: "🍦" },
    ],
  },
  {
    slug: "visiter",
    labelFr: "Visiter",
    labelEn: "Sightseeing",
    icon: "🏛️",
    color: "#0369a1",
    categories: [
      { slug: "lieu-interet", labelFr: "Lieu d'intérêt", labelEn: "Point of interest", icon: "🏛️" },
      { slug: "musee",        labelFr: "Musée",           labelEn: "Museum",            icon: "🖼️" },
      { slug: "parc",         labelFr: "Parc",            labelEn: "Park",              icon: "🌳" },
      { slug: "site-naturel", labelFr: "Site naturel",    labelEn: "Natural site",      icon: "🏔️" },
    ],
  },
  {
    slug: "detendre",
    labelFr: "Se détendre",
    labelEn: "Relax",
    icon: "🛁",
    color: "#0891b2",
    categories: [
      { slug: "spa",     labelFr: "Spa",     labelEn: "Spa",    icon: "🧖" },
      { slug: "piscine", labelFr: "Piscine", labelEn: "Pool",   icon: "🏊" },
      { slug: "plage",   labelFr: "Plage",   labelEn: "Beach",  icon: "🏖️" },
    ],
  },
  {
    slug: "dormir",
    labelFr: "Dormir",
    labelEn: "Sleep",
    icon: "🏨",
    color: "#059669",
    categories: [
      { slug: "hotel",    labelFr: "Hôtel",               labelEn: "Hotel",   icon: "🏨" },
      { slug: "auberge",  labelFr: "Auberge de jeunesse", labelEn: "Hostel",  icon: "🛏️" },
    ],
  },
  {
    slug: "shopping",
    labelFr: "Shopping",
    labelEn: "Shopping",
    icon: "🛍️",
    color: "#be185d",
    categories: [
      { slug: "magasin", labelFr: "Magasin", labelEn: "Shop", icon: "🛍️" },
    ],
  },
] as const;

// Liste plate de toutes les sous-catégories
export const MAP_CATEGORIES = MAP_CATEGORY_GROUPS.flatMap((g) =>
  g.categories.map((c) => ({ ...c, group: g.slug, groupColor: g.color, groupIcon: g.icon })),
);

export type CategorySlug = (typeof MAP_CATEGORIES)[number]["slug"];

export const getCategoryMeta = (slug: string) =>
  MAP_CATEGORIES.find((c) => c.slug === slug);

export const getGroupColor = (slug: string) =>
  MAP_CATEGORY_GROUPS.find((g) => g.categories.some((c) => c.slug === slug))?.color ?? "#6b7280";
