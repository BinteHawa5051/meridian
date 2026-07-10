import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        meridian: {
          bg: {
            DEFAULT:   "var(--bg-base)",
            primary:   "var(--bg-base)",
            secondary: "var(--bg-hover)",
            tertiary:  "var(--bg-hover)",
            card:      "var(--bg-card)",
            hover:     "var(--bg-hover)",
            elevation: "var(--bg-elevation)",
          },
          burgundy: {
            DEFAULT: "var(--burgundy)",
            light:   "#8E243D",
            bright:  "var(--burgundy-bright)",
            glow:    "#7A1F3420",
          },
          text: {
            primary:   "var(--text-primary)",
            secondary: "var(--text-secondary)",
            muted:     "var(--text-muted)",
            accent:    "var(--text-secondary)",
          },
          border: {
            DEFAULT: "var(--border)",
            subtle:  "var(--border)",
            light:   "var(--border-light)",
          },
        },
        chart: {
          blue: "#3B82F6",
          green: "#10B981",
          orange: "#F97316",
          purple: "#8B5CF6",
          red: "#EF4444",
          pink: "#EC4899",
          cyan: "#06B6D4",
          yellow: "#EAB308",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.3)",
        "card-hover": "0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.4), 0 0 40px rgba(122,31,52,0.08)",
        glow: "0 0 20px rgba(122,31,52,0.15), 0 0 40px rgba(122,31,52,0.08)",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-10px) translateX(5px)" },
          "50%": { transform: "translateY(-5px) translateX(-5px)" },
          "75%": { transform: "translateY(-15px) translateX(3px)" },
        },
        "pulse-burgundy": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-burgundy": "pulse-burgundy 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
