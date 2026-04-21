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
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(59 130 246) 0%, rgb(99 102 241) 50%, rgb(147 51 234) 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
