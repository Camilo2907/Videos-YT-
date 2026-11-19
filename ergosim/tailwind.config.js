/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: 'var(--fondo)',
        superficie: 'var(--superficie)',
        hundido: 'var(--hundido)',
        tinta: 'var(--tinta)',
        tinta2: 'var(--tinta-2)',
        tenue: 'var(--tenue)',
        linea: 'var(--linea)',
        acento: 'var(--acento)',
        'acento-suave': 'var(--acento-suave)',
        'sobre-acento': 'var(--sobre-acento)',
      },
      fontFamily: {
        titulo: ['Archivo', 'Segoe UI', 'system-ui', 'sans-serif'],
        cuerpo: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
        datos: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
