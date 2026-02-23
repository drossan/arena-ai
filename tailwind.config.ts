import type {Config} from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ArenaAI Design System Colors
        primary: '#00f3ff', // Neon Cyan
        secondary: '#bc13fe', // Neon Purple
        accent: '#ff9d00', // Neon Amber
        'background-light': '#0a0a0c',
        'background-dark': '#050505',
        // Legacy support
        neon: {
          blue: '#00f3ff',
          purple: '#bc13fe',
          green: '#39ff14',
          orange: '#ff9d00',
          gold: '#ff9d00',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        futuristic: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      animation: {
        glitch: 'glitch 1s infinite linear alternate-reverse',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 10s linear infinite',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%': { textShadow: '2px 0 #00f3ff, -2px 0 #bc13fe' },
          '50%': { textShadow: '-2px 0 #00f3ff, 2px 0 #bc13fe' },
          '100%': { textShadow: '2px 0 #00f3ff, -2px 0 #bc13fe' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(100%) blur(0px)' },
          '50%': { opacity: 0.8, filter: 'brightness(150%) blur(1px)' },
        },
        scanline: {
          '0%': { bottom: '100%' },
          '100%': { bottom: '-100px' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
