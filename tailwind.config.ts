import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          ink: "#081012",
          panel: "#0d1719",
          panel2: "#122022",
          line: "#244046",
          cyan: "#35d7ff",
          teal: "#42f2b4",
          amber: "#ffbf47",
          red: "#ff5b5b",
          violet: "#8b8cff"
        }
      },
      boxShadow: {
        beam: "0 0 24px rgba(53, 215, 255, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
