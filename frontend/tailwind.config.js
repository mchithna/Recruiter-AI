/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        secondary: colors.slate,
        success: colors.emerald,
        danger: colors.rose,
        warning: colors.amber,
        info: colors.sky,
        ai: colors.violet,
        surface: { DEFAULT: '#ffffff', subtle: colors.slate[50] },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '1.15', fontWeight: '700' }],
        'h1': ['28px', { lineHeight: '1.25', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'h4': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.45', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'overline': ['11px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        'button': '6px',
        'dropdown': '8px',
      },
      boxShadow: {
        'row-hover': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-ai': '0 0 40px rgba(139, 92, 246, 0.15)',
      },
      zIndex: {
        'sticky': '20',
        'dropdown': '30',
        'overlay': '40',
        'modal': '50',
        'toast': '60',
        'tooltip': '70',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'counter': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'counter': 'counter 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
