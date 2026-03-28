/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F3F4F6',
        primary: '#3B82F6',
      }
    },
  },
  plugins: [],
}
