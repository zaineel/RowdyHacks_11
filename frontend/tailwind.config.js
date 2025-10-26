/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Space Cowboy Theme Colors
        frontier: {
          50: "#fdf8f3",
          100: "#f7e8d7",
          200: "#edd1ae",
          300: "#e2b382",
          400: "#d89356",
          500: "#c97a3a", // Primary - Desert Orange
          600: "#b36430",
          700: "#8f4f28",
          800: "#6d3d21",
          900: "#4a2917",
        },
        starlight: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Secondary - Sky Blue
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        cosmic: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Accent - Purple
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        dusty: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c", // Neutral - Stone
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      fontFamily: {
        western: ['"Rye"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "frontier-gradient":
          "linear-gradient(135deg, #c97a3a 0%, #0ea5e9 100%)",
        starfield: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
      },
      backgroundSize: {
        starfield: "50px 50px",
      },
    },
  },
  plugins: [],
};
