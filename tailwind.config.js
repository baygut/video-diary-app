/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
          overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
          play: 'rgb(var(--color-play) / <alpha-value>)',
          'on-play': 'rgb(var(--color-on-play) / <alpha-value>)',
          'on-dark': 'rgb(var(--color-on-dark) / <alpha-value>)',
          'icon-muted': 'rgb(var(--color-icon-muted) / <alpha-value>)',
          'handle-border': 'rgb(var(--color-handle-border) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
