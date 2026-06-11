import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
      colors: {
        bg: "#080808",
        "bg-card": "#111111",
        cream: "#e8ddd0",
        muted: "#8a8a8a",
        accent: "#c4a882",
        border: "#1c1c1c",
      },
    },
  },
  plugins: [],
};

export default config;
