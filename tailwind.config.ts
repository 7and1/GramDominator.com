import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        blaze: "rgb(var(--color-blaze) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px -20px rgba(15, 23, 42, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
