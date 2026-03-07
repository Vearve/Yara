/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#05060a',
        panel: '#0b0f1a',
        card: '#0f1628',
        accent: '#f5c400',
        accentSoft: '#ffe37a',
        cyan: '#3ee7ff',
        magenta: '#ff4fd8',
        border: 'rgba(255, 227, 122, 0.25)',
      },
      boxShadow: {
        glow: '0 10px 50px rgba(245, 196, 0, 0.15)',
        panel: '0 20px 70px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl: '18px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
