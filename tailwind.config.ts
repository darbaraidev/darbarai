import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{vue,js,ts,jsx,tsx}",
    "./app/components/**/*.{vue,js,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Palette identitaire Dar Baraï / Dar Tanawi
        terracotta: {
          50: "#fdf4f0",
          100: "#fbe5da",
          200: "#f6c9b3",
          300: "#efa484",
          400: "#e67a53",
          500: "#dc5830",
          600: "#ce4123",
          700: "#ab3220",
          800: "#8a2b22",
          900: "#712721",
          950: "#3d100d",
        },
        sand: {
          50: "#fdf9f0",
          100: "#faf1db",
          200: "#f4e0b4",
          300: "#ecc882",
          400: "#e3a94e",
          500: "#db9030",
          600: "#c37023",
          700: "#a2521f",
          800: "#834221",
          900: "#6b3720",
          950: "#3a1b0d",
        },
        olive: {
          50: "#f5f6ee",
          100: "#e9ecda",
          200: "#d4dab7",
          300: "#b8c28c",
          400: "#9eaa67",
          500: "#84924a",
          600: "#677439",
          700: "#515a2f",
          800: "#424929",
          900: "#393f25",
          950: "#1d2010",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Playfair Display", "ui-serif", "Georgia"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
