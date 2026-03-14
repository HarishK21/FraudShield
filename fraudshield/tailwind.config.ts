import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(255,255,255,0.03), 0 30px 100px rgba(2, 6, 23, 0.55)",
        glow: "0 0 120px rgba(180, 101, 255, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
