/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        title:['"Alfa Slab One"', 'serif'],
        brand:['"Bungee Inline"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}