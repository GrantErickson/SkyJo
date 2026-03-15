import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        table: {
          DEFAULT: "#312e81",
          light: "#3730a3",
          dark: "#1e1b4b",
        },
      },
      animation: {
        "card-flip": "cardFlip 0.4s ease-in-out",
        "glow-pulse": "glowPulse 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "count-up": "countUp 0.5s ease-out",
      },
      keyframes: {
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(234, 179, 8, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(234, 179, 8, 0.9)" },
        },
        slideUp: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-20px)", opacity: "0" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
