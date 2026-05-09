import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Semantic tokens ─── */
        background: {
          DEFAULT:   "var(--background)",
          secondary: "var(--background-secondary)",
          tertiary:  "var(--background-tertiary)",
        },
        foreground: {
          DEFAULT:   "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          muted:     "var(--foreground-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle:  "var(--border-subtle)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          hover:      "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          hover:      "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          hover:      "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },

        /* ─── Cultural palette ─── */
        forest: {
          DEFAULT: "var(--color-forest-green)",
          light:   "var(--color-forest-green-light)",
          dark:    "var(--color-forest-green-dark)",
        },
        saffron: {
          DEFAULT: "var(--color-saffron)",
          light:   "var(--color-saffron-light)",
          dark:    "var(--color-saffron-dark)",
        },
        mountain: {
          DEFAULT: "var(--color-mountain-blue)",
          light:   "var(--color-mountain-blue-light)",
          dark:    "var(--color-mountain-blue-dark)",
        },
        earth: {
          DEFAULT: "var(--color-earth-brown)",
          light:   "var(--color-earth-brown-light)",
          dark:    "var(--color-earth-brown-dark)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          light:   "var(--color-gold-light)",
          dark:    "var(--color-gold-dark)",
        },
      },

      fontFamily: {
        sans:  ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Noto Serif", "ui-serif", "Georgia", "serif"],
        mono:  ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },

      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },

      animation: {
        shimmer:       "shimmer 2s linear infinite",
        float:         "float 4s ease-in-out infinite",
        glow:          "glow 2.5s ease-in-out infinite",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        "fade-in":     "fade-in 0.4s ease-out forwards",
        "slide-up":    "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":    "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "spin-slow":   "spin 3s linear infinite",
      },

      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(45,122,82,0.3)" },
          "50%":       { boxShadow: "0 0 32px rgba(45,122,82,0.6), 0 0 64px rgba(232,135,26,0.2)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.65" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.93)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },

      boxShadow: {
        "sm":           "0 1px 3px rgba(26,20,16,0.08)",
        "md":           "0 4px 12px rgba(26,20,16,0.12)",
        "lg":           "0 8px 32px rgba(26,20,16,0.16)",
        "xl":           "0 16px 48px rgba(26,20,16,0.2)",
        "glow-green":   "0 0 24px rgba(45,122,82,0.35)",
        "glow-saffron": "0 0 24px rgba(232,135,26,0.35)",
        "glow-blue":    "0 0 24px rgba(45,99,184,0.35)",
        "glow-gold":    "0 0 24px rgba(212,160,23,0.35)",
        "glass":        "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
      },

      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top":    "env(safe-area-inset-top, 0px)",
      },
    },
  },
  plugins: [],
};

export default config;
