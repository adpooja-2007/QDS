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
        },
        terracotta: {
          500: '#D85A38',
          600: '#C84B31',
          700: '#AA3920',
        }
      }
    },
  },
  plugins: [],
}
