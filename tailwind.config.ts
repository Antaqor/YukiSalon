// tailwind.config.js

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust based on your project structure
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        brandCyan: '#00FFFC',
        supportBorder: '#F6F3E1',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'], // Minimalistic and clean font stack
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // other plugins...
  ],
};