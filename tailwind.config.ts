import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0B0B',
          2: '#111111',
          3: '#161616',
        },
        gold: {
          DEFAULT: '#C8A96B',
          light: '#E8C98B',
          dark: '#A8872A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.12)',
        },
        muted: '#A1A1AA',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
        'gold-gradient': 'linear-gradient(135deg, #C8A96B, #A8872A)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s 1.3s ease-in-out infinite',
        'float-slow': 'float 4s 2.6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'gold': '0 8px 30px rgba(200,169,107,0.2)',
        'glow': '0 0 40px rgba(139,92,246,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
