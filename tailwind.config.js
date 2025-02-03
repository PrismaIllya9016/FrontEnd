/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'modal-show': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95) translate(0, 30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translate(0, 0)'
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(1rem)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'modal-show': 'modal-show 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 0.2s ease-out'
      },
    },
  },
  plugins: [],
}

