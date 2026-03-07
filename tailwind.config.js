/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibranium: {
          bg: '#0b0b15',
          surface: '#141428',
          card: '#1a1a2e',
          primary: '#8b5cf6',
          secondary: '#a855f7',
          accent: '#c084fc',
          glow: '#9333ea',
        },
        'vibrant-dark': '#0f0f1a',
        'vibrant-purple': '#6d28d9',
        'vibrant-light-purple': '#a855f7',
        'vibrant-accent': '#ec4899',
      },
      backgroundImage: {
        'vibranium-gradient': 'radial-gradient(circle at top, rgba(139,92,246,0.25), transparent 60%)',
        'gradient-cosmic': 'linear-gradient(to bottom right, #05010a, #0f0018, #1a0033, #2a0050, #3b0764)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-purple-lg': '0 0 40px rgba(168, 85, 247, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      fontFamily: {
        neo: ['"Neo Falia"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
