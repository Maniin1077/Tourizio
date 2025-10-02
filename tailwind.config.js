/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#008080',       // Teal / Ocean Blue
        secondary: '#FF6F61',     // Coral / Sunset Orange
        background: '#F5F5DC',    // Soft Beige
        grayLight: '#E0E0E0'      // Light Gray
      },
      fontFamily: {
        heading: ['"Times New Roman"', 'serif'],
        body: ['"Open Sans"', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)',
        medium: '0 6px 12px rgba(0,0,0,0.15)'
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding'
      },
      transitionDuration: {
        300: '300ms',
        500: '500ms'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #008080 0%, #00BFA6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF6F61 0%, #FF9A8B 100%)'
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        }
      },
      animation: {
        blink: 'blink 1s infinite'
      }
    },
  },
  plugins: [],
}
