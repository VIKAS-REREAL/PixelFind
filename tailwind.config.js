/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F7F5',
        surface: '#FFFFFF',
        'text-primary': '#171717',
        'text-secondary': '#737373',
        border: '#E7E7E4',
        accent: '#2F5D50',
        'accent-light': '#E8F0ED',
        'accent-hover': '#255048',
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
