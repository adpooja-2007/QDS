/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FCFBF8',
          100: '#FBF9F5',
          200: '#F4EFEA',
          300: '#EAE3DA',
          400: '#DDD5C8',
          500: '#C5BCAD',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEDE7',
          200: '#F6D7CC',
          300: '#ECB29F',
          400: '#E18B72',
          500: '#D85A38',
          600: '#C84B31',
          700: '#AA3920',
          800: '#8B2F1B',
          900: '#722A1A',
        },
        forest: {
          50: '#F1F7F3',
          100: '#E2EFE7',
          200: '#C7DFCF',
          300: '#9EC7AC',
          400: '#6EA982',
          500: '#488C5E',
          600: '#357248',
          700: '#2B5B3B',
          800: '#244931',
          900: '#1E3C29',
        },
      }
    },
  },
  plugins: [],
}
