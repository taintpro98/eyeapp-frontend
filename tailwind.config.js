import tailwindcssAnimate from "tailwindcss-animate";

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
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          light: "rgb(var(--brand-light) / <alpha-value>)",
          cream: "rgb(var(--brand-cream) / <alpha-value>)",
        },
        lumi: {
          orange: "rgb(var(--lumi-orange) / <alpha-value>)",
          blush: "rgb(var(--lumi-blush) / <alpha-value>)",
        },
        /* Thang xếp hạng FA: rating-5 (Xuất sắc) … rating-1 (Kém) */
        rating: {
          1: "rgb(var(--rating-1) / <alpha-value>)",
          2: "rgb(var(--rating-2) / <alpha-value>)",
          3: "rgb(var(--rating-3) / <alpha-value>)",
          4: "rgb(var(--rating-4) / <alpha-value>)",
          5: "rgb(var(--rating-5) / <alpha-value>)",
        },
        /* Nền tối ánh Tím Mận — chỉ dùng ở dark mode (box chat Lumi) */
        plum: {
          800: "#2c2130",
          850: "#28202d",
          900: "#231b27",
          950: "#1f1a23",
        },
        surface: {
          bg: "rgb(var(--surface-bg) / <alpha-value>)",
          warm: "rgb(var(--surface-warm) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(47, 29, 51, 0.06)",
        "card": "0 1px 3px rgba(47, 29, 51, 0.04)",
        "glow": "0 0 20px rgba(89, 50, 93, 0.15)",
      },
      borderRadius: {
        "card": "12px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
