/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
  extend: {
    keyframes: {
      navOpen: {
        "0%": { transform: "rotate(-3deg)" },
        "100%": { transform: "rotate(3deg)" },
      },
    },
  },
};
