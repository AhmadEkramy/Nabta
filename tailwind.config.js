/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'holographic': 'holographic 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: 1,
            filter: 'brightness(1) blur(0px)',
          },
          '50%': {
            opacity: 0.8,
            filter: 'brightness(1.5) blur(4px)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(96, 165, 250, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)',
          },
          '50%': {
            'box-shadow': '0 0 10px rgba(96, 165, 250, 0.8), 0 0 30px rgba(96, 165, 250, 0.5)',
          },
        },
        'holographic': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
        'fade-in': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(4px)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'holographic-gradient': 'linear-gradient(45deg, #60A5FA, #818CF8, #8B5CF6, #60A5FA)',
      },
    },
  },
  plugins: [],
};
