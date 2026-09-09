/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Official Brand Color Palette
        'graphite-900': '#23262C',
        'graphite-700': '#3A3F47',
        'cloud-zink': '#D1D5DB',
        'safety-orange': '#FE7733',
        'neon-sprout': '#B1FA63',
        'paper-white': '#FFFFFF',

        // Theme Mappings
        'granite': '#23262C',       // Graphite 900
        'crag': '#3A3F47',          // Graphite 700
        'crag-light': '#4A505A',
        'lime': '#B1FA63',          // Neon Sprout
        'lime-dim': '#9FE350',
        'slate-ash': '#D1D5DB',     // Cloud Zink
        'project': '#FE7733',       // Safety Orange
        'chalk': '#FFFFFF',         // Paper White
        'redpoint': '#FE7733',      // Safety Orange
        'cyan-climb': '#06B6D4',

        // Grading colors
        'grade-vb': '#D1D5DB',
        'grade-v1': '#86EFAC',
        'grade-v2': '#4ADE80',
        'grade-v3': '#FDE047',
        'grade-v4': '#FACC15',
        'grade-v5': '#FE7733',
        'grade-v6': '#F87171',
        'grade-v7': '#EF4444',
        'grade-v8': '#C026D3',
        'grade-v9': '#7C3AED',
        'grade-v10plus': '#1D4ED8',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        helvetica: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(180deg, transparent 0%, #23262C 100%)',
        'card-gradient': 'linear-gradient(135deg, #3A3F47 0%, #23262C 100%)',
      },
      boxShadow: {
        'lime-glow': '0 0 20px rgba(177, 250, 99, 0.35)',
        'lime-glow-sm': '0 0 10px rgba(177, 250, 99, 0.25)',
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
        'xl4': '2rem',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'nav-height': '4.5rem',
      },
      animation: {
        'pulse-lime': 'pulse-lime 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-lime': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(177,250,99,0.25)' },
          '50%': { boxShadow: '0 0 25px rgba(177,250,99,0.5)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
