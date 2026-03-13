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
          primary: "var(--brand-primary)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
        },
        surface: {
          bg: "var(--surface-bg)",
          warm: "var(--surface-warm)",
          card: "var(--surface-card)",
          border: "var(--surface-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
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
