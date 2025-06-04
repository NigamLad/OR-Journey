/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        pulse: {
          '0%': { r: '6', opacity: '0.6' },
          '50%': { r: '7', opacity: '0.3' },
          '100%': { r: '6', opacity: '0.6' },
        }
      },
      dropShadow: {
        'event': '0 0 2px rgba(255, 255, 255, 0.7)',
        'arc': '0 0 4px rgba(255, 255, 255, 0.4)',
      }
    },
  },
  plugins: [],
}

