import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "2rem", lg: "3rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Brand scales
        // Ink: navy-black type and deep navy panels. Body copy sits at 600–700.
        navy: {
          50: "#F1F2F5",
          100: "#E0E3EA",
          200: "#C2C7D3",
          300: "#9198AA",
          400: "#62697D",
          500: "#4F576C",
          600: "#3A4257",
          700: "#283046",
          800: "#1B2A4A",
          900: "#131A2B",
          950: "#0B1020",
        },
        // Paper: warm ivory surfaces.
        cream: {
          DEFAULT: "#F4EFE4",
          100: "#EFE9DC",
          200: "#E5DDCB",
          300: "#D3C8B2",
        },
        ink: "#131A2B",
        paper: "#F4EFE4",
        // Amber: fills at 400–500, readable text on paper at 700–800.
        amber: {
          50: "#FBF4E4",
          100: "#F6E6C3",
          200: "#F0D396",
          300: "#EBBE66",
          400: "#EDAE4C",
          500: "#E8A33D",
          600: "#C9861E",
          700: "#995B00",
          800: "#7A4700",
          900: "#5A3500",
        },
        // shadcn tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        // Restrained: hairlines do the structural work, shadows only lift what floats.
        soft: "0 1px 0 rgba(19,26,43,0.04)",
        lift: "0 30px 60px -40px rgba(19,26,43,0.45)",
        glow: "0 0 0 1px rgba(232,163,61,0.6)",
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
