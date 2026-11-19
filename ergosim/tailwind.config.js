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
        titulo: ['"Bricolage Grotesque"', 'Segoe UI', 'system-ui', 'sans-serif'],
        cuerpo: ['"Plus Jakarta Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
        datos: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
