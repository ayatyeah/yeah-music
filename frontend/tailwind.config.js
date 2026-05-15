/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yeah-accent': '#1ED760',
        'yeah-bg': '#121212',
        'yeah-surface': '#181818',
        'yeah-surface-hover': '#282828',
        'yeah-base': '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}