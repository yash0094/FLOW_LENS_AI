/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#5B21B6',
          700: '#4C1D95',
          900: '#2E1065',
        },
        ok: { 500: '#059669', 100: '#D1FAE5' },
        warn: { 500: '#D97706', 100: '#FEF3C7' },
        danger: { 500: '#DC2626', 100: '#FEE2E2' },
        ink: { 900: '#1F2937', 500: '#6B7280', 200: '#E5E7EB' },
        canvas: '#F7F6FB',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(91, 33, 182, 0.06)',
        floating: '0 12px 30px rgba(91, 33, 182, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
