/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#8b0000",
          dark:    "#6e0000",
          darker:  "#5a0000",
          light:   "#fde8e8",
        },
        surface: "#f5f5f7",
      },
      fontFamily: {
        sans: [
          "Instrument Sans Variable",
          "Instrument Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: ["Playfair Display", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        dropdown: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
