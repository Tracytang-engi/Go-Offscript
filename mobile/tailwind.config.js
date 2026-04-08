/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FAF5EE',
        orange: '#E8603A',
        'orange-light': '#FDE8E0',
        'orange-muted': '#F4A68A',
        amber: '#FFF3CD',
        dark: '#1A1A1A',
        muted: '#6B7280',
        'green-dot': '#22C55E',
        salmon: '#FBBFAE',
        'green-badge': '#D1FAE5',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
