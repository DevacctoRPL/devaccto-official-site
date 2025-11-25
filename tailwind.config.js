/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme color palette
        dark: {
          background: '#262B43',
          'secondary-background': '#313651',
          'menu-background': '#62929A',
          text: '#FFFFFF',
          'text-secondary': '#D3D3D3',
          'text-tertiary': '#EEEEEE',
        },
        // Light theme color palette
        light: {
          background: '#7A7A7A',
          'secondary-background': '#F0F0F0',
          text: '#D1D1D1',
          'text-secondary': '#D9D9D9',
          'menu-background': '#62929A',
        },
        // Legacy colors for compatibility
        primary: {
          dark: '#262B43', // Dark blue for dark mode
          light: '#313651', // Slightly lighter blue
        },
        secondary: {
          DEFAULT: '#62929A', // Teal/cyan color
        },
        gray: {
          100: '#FFFFFF',
          200: '#F0F0F0',
          300: '#EEEEEE', 
          400: '#D9D9D9',
          500: '#D3D3D3',
          600: '#7A7A7A',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropFilter: {
        'glass': 'blur(10px)',
      },
    },
  },
  plugins: [],
}
