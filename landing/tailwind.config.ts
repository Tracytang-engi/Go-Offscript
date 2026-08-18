import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF5EE",
        orange: "#E8603A",
        "orange-light": "#FDE8E0",
        "orange-muted": "#F4A68A",
        dark: "#1A1A1A",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
