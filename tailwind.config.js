/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#6366f1',
          500: '#6366f1',
          600: '#4f46e5',
        },
        owed: '#34d399',
        owe: '#fb7185',
      },
    },
  },
  plugins: [],
};
