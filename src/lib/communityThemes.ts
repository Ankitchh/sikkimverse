// Cultural color palettes for each of Sikkim's 10 indigenous communities.
// Each palette is derived from traditional attire, ornaments, and regional aesthetics.

export interface CommunityTheme {
  primary: string;        // Main accent color
  secondary: string;      // Secondary / darker shade
  bg: string;             // Subtle tinted background
  bgDark: string;         // Dark mode background tint
  border: string;         // Border color
  gradient: string;       // Hero gradient (Tailwind classes)
  textAccent: string;     // Tailwind text color class
  badgeBg: string;        // Badge background class
  pattern: string;        // CSS pattern description (decorative)
  emoji: string;
  region: string;
  tagline: string;
}

export const COMMUNITY_THEMES: Record<string, CommunityTheme> = {
  lepcha: {
    primary: "#16A34A",
    secondary: "#15803D",
    bg: "rgba(22,163,74,0.06)",
    bgDark: "rgba(22,163,74,0.12)",
    border: "rgba(22,163,74,0.25)",
    gradient: "from-emerald-800 via-green-700 to-teal-800",
    textAccent: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    pattern: "forest",
    emoji: "🌿",
    region: "North & West Sikkim",
    tagline: "Children of Nature — Guardians of Mayel Lyang",
  },
  bhutia: {
    primary: "#9B1C1C",
    secondary: "#7F1D1D",
    bg: "rgba(155,28,28,0.06)",
    bgDark: "rgba(155,28,28,0.12)",
    border: "rgba(155,28,28,0.25)",
    gradient: "from-red-900 via-red-800 to-amber-900",
    textAccent: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    pattern: "monastery",
    emoji: "🏔️",
    region: "East & North Sikkim",
    tagline: "Monastery Elegance — Guardians of Vajrayana Tradition",
  },
  limbu: {
    primary: "#92400E",
    secondary: "#78350F",
    bg: "rgba(146,64,14,0.06)",
    bgDark: "rgba(146,64,14,0.12)",
    border: "rgba(146,64,14,0.25)",
    gradient: "from-amber-900 via-orange-800 to-yellow-900",
    textAccent: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    pattern: "woven",
    emoji: "🎋",
    region: "East Sikkim",
    tagline: "Warriors of the Mundhum — Keepers of Sirijonga Script",
  },
  tamang: {
    primary: "#7B3F00",
    secondary: "#6B3A00",
    bg: "rgba(123,63,0,0.06)",
    bgDark: "rgba(123,63,0,0.12)",
    border: "rgba(123,63,0,0.25)",
    gradient: "from-stone-800 via-amber-900 to-orange-900",
    textAccent: "text-orange-800 dark:text-orange-400",
    badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    pattern: "mountain",
    emoji: "🐎",
    region: "West & South Sikkim",
    tagline: "Mountain Traders — Keepers of Damphu Rhythms",
  },
  rai: {
    primary: "#065F46",
    secondary: "#064E3B",
    bg: "rgba(6,95,70,0.06)",
    bgDark: "rgba(6,95,70,0.12)",
    border: "rgba(6,95,70,0.25)",
    gradient: "from-emerald-900 via-teal-900 to-cyan-900",
    textAccent: "text-teal-700 dark:text-teal-400",
    badgeBg: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    pattern: "bamboo",
    emoji: "🌾",
    region: "East & South Sikkim",
    tagline: "Kiranti Descendants — Oral Historians of the Hills",
  },
  gurung: {
    primary: "#1E40AF",
    secondary: "#1E3A8A",
    bg: "rgba(30,64,175,0.06)",
    bgDark: "rgba(30,64,175,0.12)",
    border: "rgba(30,64,175,0.25)",
    gradient: "from-blue-900 via-indigo-900 to-violet-900",
    textAccent: "text-blue-700 dark:text-blue-400",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    pattern: "cloud",
    emoji: "🌊",
    region: "West Sikkim",
    tagline: "Tamu Warriors — Dancers of the Ghatu",
  },
  sherpa: {
    primary: "#0F4C75",
    secondary: "#0D3D5E",
    bg: "rgba(15,76,117,0.06)",
    bgDark: "rgba(15,76,117,0.12)",
    border: "rgba(15,76,117,0.25)",
    gradient: "from-sky-900 via-blue-900 to-indigo-900",
    textAccent: "text-sky-700 dark:text-sky-400",
    badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    pattern: "peak",
    emoji: "⛰️",
    region: "North Sikkim",
    tagline: "Mountain Guides — Guardians of the High Peaks",
  },
  mangar: {
    primary: "#7E22CE",
    secondary: "#6B21A8",
    bg: "rgba(126,34,206,0.06)",
    bgDark: "rgba(126,34,206,0.12)",
    border: "rgba(126,34,206,0.25)",
    gradient: "from-purple-900 via-violet-900 to-fuchsia-900",
    textAccent: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    pattern: "spiral",
    emoji: "🌸",
    region: "South Sikkim",
    tagline: "Ancient Magars — Artisans of the Southern Hills",
  },
  newar: {
    primary: "#B45309",
    secondary: "#92400E",
    bg: "rgba(180,83,9,0.06)",
    bgDark: "rgba(180,83,9,0.12)",
    border: "rgba(180,83,9,0.25)",
    gradient: "from-yellow-900 via-amber-800 to-orange-900",
    textAccent: "text-yellow-700 dark:text-yellow-400",
    badgeBg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    pattern: "pagoda",
    emoji: "🏛️",
    region: "South & East Sikkim",
    tagline: "Artisans of the Valley — Keepers of Newari Craft",
  },
  sunwar: {
    primary: "#BE123C",
    secondary: "#9F1239",
    bg: "rgba(190,18,60,0.06)",
    bgDark: "rgba(190,18,60,0.12)",
    border: "rgba(190,18,60,0.25)",
    gradient: "from-rose-900 via-pink-900 to-red-900",
    textAccent: "text-rose-700 dark:text-rose-400",
    badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    pattern: "arrow",
    emoji: "🎯",
    region: "East Sikkim",
    tagline: "Kiranti Warriors — Speakers of Kõits Language",
  },
};

export function getCommunityTheme(slug: string): CommunityTheme {
  return COMMUNITY_THEMES[slug.toLowerCase()] ?? COMMUNITY_THEMES["lepcha"];
}
