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
          elevated: 'rgba(38, 52, 78, 0.55)',
        },
        border: {
          color: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.14)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#10b981', // primary
          500: '#10b981',
          600: '#059669',
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
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
        md: '0 8px 30px rgba(0, 0, 0, 0.4)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.5)',
        glow: '0 0 24px rgba(16, 185, 129, 0.25)',
        'glow-sm': '0 0 12px rgba(16, 185, 129, 0.2)',
        'btn-primary': '0 4px 14px rgba(16, 185, 129, 0.3)',
        'fab': '0 8px 24px rgba(16, 185, 129, 0.4)',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'button-gradient': 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
