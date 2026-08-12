/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        inkdark: "#0D1730",
        accent: "#F2A93B",
        accentdark: "#D98F1E",
        teal: "#0E9594",
        surface: "#F5F7FA",
        ink50: "#EEF1F6",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      clipPath: {
        tag: "polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)",
      },
    },
  },
  plugins: [],
};
