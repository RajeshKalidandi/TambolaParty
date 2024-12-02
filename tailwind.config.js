/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1E1E1E',
          700: '#2D2D2D',
          400: '#A0A0A0',
          300: '#D4D4D4',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
      },
    },
  },
  plugins: [],
};