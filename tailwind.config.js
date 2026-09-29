/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Prompt', 'system-ui', 'sans-serif'] },
      colors: {
        bg: '#eaf5f6', line: '#d3e5e8', pri: '#0e8a8c', soft: '#d6eff0',
        sun: '#ffb703', ink: '#15303a', mute: '#5d7882',
      },
    },
  },
  plugins: [],
}
