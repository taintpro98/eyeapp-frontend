/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6F2C91",
          dark: "#4B1F63",
          light: "#8B5FBF",
        },
        surface: {
          bg: "#F4F0EA",
          warm: "#F7F4EF",
          card: "#FFFFFF",
          border: "#E7DFD6",
        },
        text: {
          primary: "#2E2630",
          secondary: "#6E6470",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(46, 38, 48, 0.06)",
        "card": "0 1px 3px rgba(46, 38, 48, 0.04)",
        "glow": "0 0 20px rgba(111, 44, 145, 0.15)",
      },
      borderRadius: {
        "card": "12px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
