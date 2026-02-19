import type { Config } from "tailwindcss";

import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

const config: Config = {
  darkMode: "class",

  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#4387f4",
        "background-light": "#f8fafc",
        "background-dark": "#101722",
      },
    },
  },

  plugins: [forms, containerQueries],
};

export default config;
