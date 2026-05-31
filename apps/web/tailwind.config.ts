import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pslPurple: "#6B2C91",
        pslGold: "#FFD700",
        pslDark: "#1A0033"
      }
    }
  },
  plugins: []
};

export default config;