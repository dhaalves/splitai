/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          darker: '#090d16',
          dark: '#0f1626',
          card: 'rgba(30, 41, 59, 0.7)',
        },
        border: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#10b981', // primary
          500: '#10b981',
          600: '#059669', // using gradient end as 600
          glow: 'rgba(16, 185, 129, 0.2)',
          secondary: '#eab308',
          'secondary-glow': 'rgba(234, 179, 8, 0.2)',
          danger: '#ef4444',
        },
        owed: '#34d399',
        owe: '#fb7185',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
        md: '0 8px 30px rgba(0, 0, 0, 0.4)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'button-gradient': 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      }
    },
  },
  plugins: [],
};
