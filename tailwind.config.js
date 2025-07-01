/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced dark mode colors
        gray: {
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        blue: {
          900: '#1e3a8a',
        },
        indigo: {
          900: '#312e81',
        },
        purple: {
          900: '#4a1d96',
        },
        green: {
          900: '#064e3b',
        },
        red: {
          900: '#7f1d1d',
        },
        orange: {
          900: '#7c2d12',
        },
        yellow: {
          900: '#78350f',
        },
      },
      boxShadow: {
        // Enhanced shadows for dark mode
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundOpacity: {
        '15': '0.15',
        '85': '0.85',
      },
      animation: {
        'fall-1': 'fall-1 2s ease-in-out infinite',
        'fall-2': 'fall-2 2.2s ease-in-out infinite 0.2s',
        'fall-3': 'fall-3 1.8s ease-in-out infinite 0.4s',
        'fall-4': 'fall-4 2.4s ease-in-out infinite 0.6s',
        'fall-5': 'fall-5 2s ease-in-out infinite 0.8s',
      },
      keyframes: {
        'fall-1': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: 0 },
          '10%': { opacity: 1 },
          '100%': { transform: 'translateY(100%) rotate(180deg)', opacity: 0 },
        },
        'fall-2': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: 0 },
          '15%': { opacity: 1 },
          '100%': { transform: 'translateY(100%) rotate(-180deg)', opacity: 0 },
        },
        'fall-3': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: 0 },
          '20%': { opacity: 1 },
          '100%': { transform: 'translateY(100%) rotate(90deg)', opacity: 0 },
        },
        'fall-4': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: 0 },
          '25%': { opacity: 1 },
          '100%': { transform: 'translateY(100%) rotate(-90deg)', opacity: 0 },
        },
        'fall-5': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: 0 },
          '30%': { opacity: 1 },
          '100%': { transform: 'translateY(100%) rotate(45deg)', opacity: 0 },
        },
      }
    },
  },
  plugins: [],
};