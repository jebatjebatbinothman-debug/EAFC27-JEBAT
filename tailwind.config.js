/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stadium: '#071B13',
        greenGlow: '#A3FF69',
        greenDark: '#123524',
        gold: '#FFD700',
      },
      boxShadow: {
        neon: '0 0 18px rgba(163, 255, 105, 0.52)',
      },
    },
  },
  plugins: [],
};
