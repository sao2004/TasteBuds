/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Această linie îi spune lui Tailwind să scaneze fișierele tale
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}