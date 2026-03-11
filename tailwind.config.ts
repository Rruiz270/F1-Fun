import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          'dark-red': '#B30500',
          carbon: '#1A1A2E',
          'carbon-light': '#16213E',
          navy: '#0F3460',
          gold: '#FFD700',
          'gold-dark': '#DAA520',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        // Team colors
        team: {
          redbull: '#3671C6',
          ferrari: '#E80020',
          mclaren: '#FF8000',
          mercedes: '#27F4D2',
          astonmartin: '#229971',
          alpine: '#0093CC',
          williams: '#64C4FF',
          haas: '#B6BABD',
          rb: '#6692FF',
          sauber: '#52E252',
        },
      },
      animation: {
        'coin-spin': 'coinSpin 1s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        coinSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px #FFD700' },
          '50%': { boxShadow: '0 0 20px #FFD700, 0 0 40px #DAA520' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
