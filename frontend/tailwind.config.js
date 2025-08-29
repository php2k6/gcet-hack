/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bitter: ["Bitter", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#ff9800", // Orange
        },
        dark: {
          DEFAULT: '#003049', 
        }

      },
    },
  },
  plugins: [],
};
