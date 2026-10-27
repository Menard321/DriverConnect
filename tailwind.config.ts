import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "var(--app-primary, hsl(var(--primary)))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "var(--app-primary-hover, hsl(var(--primary-hover)))",
          light: "var(--app-primary-light, rgba(245, 158, 11, 0.15))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "var(--app-primary, hsl(var(--accent)))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "var(--app-primary, hsl(var(--ring)))",
        "primary-accent": "#e0533c",
        "primary-accent-hover": "#d04631",
        "card-warm-bg": "#fbf5f2",
        "card-warm-border": "#f0ded8",
        "neutral-page-bg": "#f8f9fa",
      },
      borderRadius: {
        lg: "var(--app-radius, var(--radius))",
        md: "calc(var(--app-radius, var(--radius)) - 2px)",
        sm: "calc(var(--app-radius, var(--radius)) - 4px)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 4px rgba(245, 158, 11, 0.2))" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        ripple: "ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
