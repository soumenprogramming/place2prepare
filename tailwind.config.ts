import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(224 76% 57%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(224 76% 57%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(214 32% 95%)",
          foreground: "hsl(215 16% 47%)",
        },
      },
      boxShadow: {
        soft: "0 16px 40px -20px rgba(30, 41, 59, 0.35)",
        glow: "0 0 40px -10px rgba(99, 102, 241, 0.4)",
        "glow-sm": "0 0 20px -5px rgba(99, 102, 241, 0.3)",
        card: "0 4px 24px -4px rgba(15, 23, 42, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 12px 40px -8px rgba(15, 23, 42, 0.14), 0 2px 8px -2px rgba(15, 23, 42, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out",
        "fade-up": "fade-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(59 130 246) 0%, rgb(99 102 241) 50%, rgb(147 51 234) 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.12) 50%, rgba(147,51,234,0.12) 100%)",
        "hero-mesh":
          "radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147,51,234,0.25) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.2) 0%, transparent 50%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 60%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
