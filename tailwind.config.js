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
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          'accent-muted': 'rgb(var(--color-accent-muted) / <alpha-value>)',
          danger: 'rgb(var(--color-danger) / <alpha-value>)',
          'danger-muted': 'rgb(var(--color-danger-muted) / <alpha-value>)',
          video: 'rgb(var(--color-video-surface) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
