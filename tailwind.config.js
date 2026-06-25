/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          background: 'rgb(var(--color-background) / <alpha-value>)',
          element: 'rgb(var(--color-background-element) / <alpha-value>)',
          selected: 'rgb(var(--color-background-selected) / <alpha-value>)',
          text: 'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
